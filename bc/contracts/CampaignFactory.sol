// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";
import "./ValidatorPool.sol";
import "./SupplierRegistry.sol";

/**
 * @title CampaignFactory
 * @author Fundraising Blockchain Team
 * @notice Contract trung tâm để khởi tạo và quản lý các chiến dịch gây quỹ.
 * @dev Áp dụng quy trình: Gửi yêu cầu -> Admin duyệt -> Deploy.
 */
contract CampaignFactory is Events {
    /// @notice Địa chỉ Platform Admin (người deploy hoặc quản trị hệ thống)
    address public admin;

    /// @notice Phí chống spam khi tạo chiến dịch (0.005 ETH)
    uint256 public antiSpamFee = 0.005 ether;

    /// @notice Danh sách địa chỉ các chiến dịch đã deploy
    address[] public deployedCampaigns;

    /// @notice Mapping từ manager address đến các campaigns họ đã tạo
    mapping(address => address[]) public campaignsByManager;

    /// @notice Danh sách chiến dịch phân loại theo danh mục (On-chain Index)
    mapping(Category => address[]) public categoryToCampaigns;

    /// @notice Sổ cái Nhà cung cấp dùng chung cho tất cả Campaign
    SupplierRegistry public supplierRegistry;

    /// @notice Thống kê toàn cục
    uint256 public totalGlobalDonated; // Tổng tiền (Wei)
    
    /// @notice Kiểm tra địa chỉ có phải là Campaign hợp lệ do Factory tạo ra không
    mapping(address => bool) public isChildCampaign;
    
    /// @notice Danh sách các Campaign mà một user đã donate
    mapping(address => address[]) public userDonatedCampaigns;
    
    /// @notice Tránh lưu trùng lặp Campaign vào mảng của user để tiết kiệm Gas
    mapping(address => mapping(address => bool)) private hasDonatedTo;

    // =====================
    // Approval Workflow
    // =====================
    enum RequestStatus { PENDING, APPROVED, REJECTED }

    struct CampaignRequest {
        address manager;
        string name;
        string description;
        string imageHash;
        Category category;
        uint256 minimumContribution;
        RequestStatus status;
        address deployedAddress;
    }

    /// @notice Mapping ID yêu cầu -> Thông tin yêu cầu
    mapping(uint256 => CampaignRequest) public campaignRequests;
    
    /// @notice Tổng số yêu cầu đã gửi
    uint256 public requestCount;

    /// @notice Mapping lưu danh sách ID yêu cầu tạo chiến dịch của một Manager
    mapping(address => uint256[]) public requestIdsByManager;

    /// @dev Chỉ cho phép Admin gọi
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    /**
     * @notice Khởi tạo Factory với SupplierRegistry đã deploy sẵn.
     * @param _supplierRegistry Địa chỉ của SupplierRegistry contract.
     * @param _admin Địa chỉ quản trị viên.
     */
    constructor(address _supplierRegistry, address _admin) {
        if (_admin == address(0) || _supplierRegistry == address(0)) revert InvalidAddress();
        supplierRegistry = SupplierRegistry(_supplierRegistry);
        admin = _admin;
    }

    /**
     * @notice Cập nhật phí chống spam.
     * @param _newFee Phí mới tính bằng Wei.
     */
    function updateAntiSpamFee(uint256 _newFee) external onlyAdmin {
        uint256 oldFee = antiSpamFee;
        antiSpamFee = _newFee;
        emit AntiSpamFeeUpdated(oldFee, _newFee);
    }

    /**
     * @notice Chuyển giao quyền Quản trị hệ thống cho một địa chỉ khác.
     * @param _newAdmin Địa chỉ của Admin mới.
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        if (_newAdmin == address(0)) revert InvalidAddress();
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminTransferred(oldAdmin, _newAdmin);
    }

    /**
     * @notice Gửi yêu cầu tạo chiến dịch mới.
     * @param name Tên chiến dịch.
     * @param category Danh mục chiến dịch.
     * @param minimum Số tiền tối thiểu (wei).
     */
    function submitCampaignRequest(string calldata name, string calldata description, string calldata imageHash, Category category, uint256 minimum) external payable {
        if (msg.value < antiSpamFee) revert IncorrectFee();
        if (bytes(name).length == 0) revert EmptyName();
        if (bytes(description).length == 0) revert EmptyDescription();
        if (bytes(imageHash).length == 0) revert EmptyEvidenceHash();
        if (minimum == 0) revert InsufficientFunds();

        uint256 requestId = requestCount++;
        campaignRequests[requestId] = CampaignRequest({
            manager: msg.sender,
            name: name,
            description: description,
            imageHash: imageHash,
            category: category,
            minimumContribution: minimum,
            status: RequestStatus.PENDING,
            deployedAddress: address(0)
        });

        requestIdsByManager[msg.sender].push(requestId);

        emit CampaignRequestSubmitted(requestId, msg.sender, name, description, imageHash, category, minimum);
    }

    /**
     * @notice Admin duyệt yêu cầu và chính thức deploy Campaign.
     * @param requestId ID của yêu cầu cần duyệt.
     */
    function approveCampaignRequest(uint256 requestId) external onlyAdmin {
        if (requestId >= requestCount) revert InvalidRequestIndex();
        CampaignRequest storage req = campaignRequests[requestId];
        if (req.status != RequestStatus.PENDING) revert RequestAlreadyProcessed();

        req.status = RequestStatus.APPROVED;
        
        // Deploy các contract liên quan
        ValidatorPool pool = new ValidatorPool(req.manager);
        Campaign newCampaign = new Campaign(
            req.name,
            req.description,
            req.imageHash,
            req.category,
            req.minimumContribution,
            req.manager,
            address(pool),
            address(supplierRegistry)
        );
        
        address campaignAddr = address(newCampaign);
        req.deployedAddress = campaignAddr;

        // Lưu trữ vào index
        deployedCampaigns.push(campaignAddr);
        campaignsByManager[req.manager].push(campaignAddr);
        categoryToCampaigns[req.category].push(campaignAddr);
        isChildCampaign[campaignAddr] = true;

        emit CampaignRequestApproved(requestId, campaignAddr);
        emit CampaignStarted(campaignAddr, req.manager, req.name, req.description, req.imageHash, req.category, req.minimumContribution);
    }

    /**
     * @notice Admin từ chối yêu cầu tạo chiến dịch.
     * @param requestId ID của yêu cầu.
     */
    function rejectCampaignRequest(uint256 requestId) external onlyAdmin {
        if (requestId >= requestCount) revert InvalidRequestIndex();
        CampaignRequest storage req = campaignRequests[requestId];
        if (req.status != RequestStatus.PENDING) revert RequestAlreadyProcessed();

        req.status = RequestStatus.REJECTED;

        emit CampaignRequestRejected(requestId);
    }

    /**
     * @notice Admin rút tiền phí chống spam về ví.
     */
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientFunds();
        (bool success, ) = admin.call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    // =====================
    // VIEW FUNCTIONS
    // =====================

    /// @notice Các kiểu truy vấn hỗ trợ
    enum QueryType { ALL, BY_MANAGER, BY_CATEGORY }

    /**
     * @notice Truy vấn chiến dịch nâng cao với nhiều tiêu chí lọc và phân trang.
     * @param queryType Kiểu truy vấn (ALL, BY_MANAGER, BY_CATEGORY).
     * @param _manager Địa chỉ manager (nếu dùng BY_MANAGER).
     * @param _category Danh mục (nếu dùng BY_CATEGORY).
     * @param offset Vị trí bắt đầu.
     * @param limit Số lượng tối đa.
     * @return campaigns Mảng địa chỉ các campaign thỏa mãn điều kiện.
     */
    function getCampaigns(
        QueryType queryType,
        address _manager,
        Category _category,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory campaigns) {
        address[] storage source;
        
        if (queryType == QueryType.ALL) {
            source = deployedCampaigns;
        } else if (queryType == QueryType.BY_MANAGER) {
            source = campaignsByManager[_manager];
        } else {
            source = categoryToCampaigns[_category];
        }

        uint256 total = source.length;
        if (offset >= total || limit == 0) return new address[](0);

        uint256 size = limit;
        if (offset + limit > total) {
            size = total - offset;
        }

        campaigns = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            campaigns[i] = source[offset + i];
        }
    }

    /**
     * @notice Lấy tổng số chiến dịch của một manager cụ thể.
     */
    function getManagerCount(address _manager) external view returns (uint256) {
        return campaignsByManager[_manager].length;
    }

    /**
     * @notice Lấy tổng số chiến dịch trong một danh mục cụ thể.
     */
    function getCategoryCount(Category _category) external view returns (uint256) {
        return categoryToCampaigns[_category].length;
    }

    /**
     * @notice Lấy tổng số chiến dịch toàn hệ thống.
     */
    function getCampaignsCount() external view returns (uint256) {
        return deployedCampaigns.length;
    }

    // =====================
    // GLOBAL STATS (UPDATE FROM CHILD)
    // =====================

    /**
     * @notice Hàm để các Campaign con báo cáo số liệu quyên góp.
     * @param donor Địa chỉ ví người quyên góp.
     * @param amount Số tiền quyên góp mới.
     */
    function recordDonation(address donor, uint256 amount) external {
        if (!isChildCampaign[msg.sender]) revert NotAuthorized();
        
        // Chỉ lưu địa chỉ campaign vào danh sách của user nếu là lần đầu donate cho campaign này
        if (!hasDonatedTo[donor][msg.sender]) {
            userDonatedCampaigns[donor].push(msg.sender);
            hasDonatedTo[donor][msg.sender] = true;
        }

        totalGlobalDonated += amount;
    }

    /**
     * @notice Lấy thông tin chi tiết lịch sử đóng góp của một user với phân trang.
     * @param user Địa chỉ ví người dùng.
     * @param offset Vị trí bắt đầu.
     * @param limit Số lượng tối đa.
     * @return campaigns Mảng các địa chỉ campaign.
     * @return amounts Mảng các số tiền tương ứng đã đóng góp.
     * @return total Tổng số lượng campaign người này đã tham gia.
     */
    function getUserDonationDetails(
        address user,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory campaigns,
        uint256[] memory amounts,
        uint256 total
    ) {
        address[] storage list = userDonatedCampaigns[user];
        total = list.length;

        if (offset >= total || limit == 0) {
            return (new address[](0), new uint256[](0), total);
        }

        uint256 size = limit;
        if (offset + limit > total) {
            size = total - offset;
        }

        campaigns = new address[](size);
        amounts = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            address campaignAddr = list[offset + i];
            campaigns[i] = campaignAddr;
            // Truy vấn trực tiếp contribution từ campaign con
            amounts[i] = Campaign(campaignAddr).contributions(user);
        }

        return (campaigns, amounts, total);
    }

    /**
     * @notice Lấy thông tin thống kê tổng quát của toàn hệ thống (cho Dashboard).
     * @return campaignsCount Tổng số chiến dịch.
     * @return globalDonated Tổng số tiền đã gây quỹ.
     */
    function getGlobalStats() external view returns (
        uint256 campaignsCount,
        uint256 globalDonated
    ) {
        return (
            deployedCampaigns.length,
            totalGlobalDonated
        );
    }

    /**
     * @notice Lấy danh sách yêu cầu tạo chiến dịch (Admin Dashboard)
     * @param offset Vị trí bắt đầu
     * @param limit Số lượng tối đa
     */
    function getCampaignRequests(uint256 offset, uint256 limit) external view returns (
        CampaignRequest[] memory requests,
        uint256 total
    ) {
        total = requestCount;
        if (offset >= total || limit == 0) {
            return (new CampaignRequest[](0), total);
        }

        uint256 size = limit;
        if (offset + limit > total) size = total - offset;

        requests = new CampaignRequest[](size);
        for (uint256 i = 0; i < size; i++) {
            requests[i] = campaignRequests[offset + i];
        }
        
        return (requests, total);
    }

    /**
     * @notice Lấy danh sách yêu cầu tạo chiến dịch của một Manager (Manager Dashboard)
     * @param _manager Địa chỉ của Manager
     * @param offset Vị trí bắt đầu
     * @param limit Số lượng tối đa
     */
    function getManagerRequests(address _manager, uint256 offset, uint256 limit) external view returns (
        CampaignRequest[] memory requests,
        uint256[] memory requestIds,
        uint256 total
    ) {
        uint256[] storage managerReqIds = requestIdsByManager[_manager];
        total = managerReqIds.length;
        
        if (offset >= total || limit == 0) {
            return (new CampaignRequest[](0), new uint256[](0), total);
        }

        uint256 size = limit;
        if (offset + limit > total) size = total - offset;

        requests = new CampaignRequest[](size);
        requestIds = new uint256[](size);
        
        for (uint256 i = 0; i < size; i++) {
            uint256 reqId = managerReqIds[offset + i];
            requestIds[i] = reqId;
            requests[i] = campaignRequests[reqId];
        }
        
        return (requests, requestIds, total);
    }
}
