// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Errors.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

/**
 * @title ValidatorPool
 * @notice Quản lý danh sách các validator được cộng đồng tin tưởng.
 * @dev Hỗ trợ cơ chế chọn ngẫu nhiên validator cho các request nhỏ.
 */
contract ValidatorPool is ERC2771Context {
    /// @notice Mapping để kiểm tra nhanh một địa chỉ có phải validator không
    mapping(address => bool) public isValidator;

    /// @notice Mapping để lưu vị trí của validator trong mảng (để xóa O(1))
    mapping(address => uint256) private validatorIndex;

    /// @notice Danh sách địa chỉ validator
    address[] public validators;

    /// @notice Địa chỉ quản trị (thường là CampaignFactory hoặc DAO)
    address public admin;

    modifier onlyAdmin() {
        if (_msgSender() != admin) revert NotAdmin();
        _;
    }

    constructor(address _admin, address trustedForwarder) ERC2771Context(trustedForwarder) {
        admin = _admin;
    }

    /**
     * @notice Thêm validator mới vào pool.
     */
    function addValidator(address _validator) external onlyAdmin {
        if (_validator == address(0)) revert InvalidAddress();
        if (isValidator[_validator]) return;
        
        validatorIndex[_validator] = validators.length;
        validators.push(_validator);
        isValidator[_validator] = true;
    }

    /**
     * @notice Loại bỏ validator khỏi pool.
     */
    function removeValidator(address _validator) external onlyAdmin {
        if (!isValidator[_validator]) return;
        
        uint256 indexToRemove = validatorIndex[_validator];
        uint256 lastIndex = validators.length - 1;

        if (indexToRemove != lastIndex) {
            address lastValidator = validators[lastIndex];
            validators[indexToRemove] = lastValidator;
            validatorIndex[lastValidator] = indexToRemove;
        }

        validators.pop();
        delete validatorIndex[_validator];
        isValidator[_validator] = false;
    }

    /**
     * @notice Lấy danh sách 3 validator ngẫu nhiên cho một request.
     * @param seed Một con số ngẫu nhiên (ví dụ requestIndex + block.timestamp).
     * @return result Mảng chứa 3 địa chỉ validator.
     */
    function getRandomValidators(uint256 seed) external view returns (address[] memory) {
        if (validators.length < 3) revert NotAuthorizedValidator(); // Pool quá nhỏ

        address[] memory result = new address[](3);
        uint256[] memory indices = new uint256[](3);
        
        for (uint i = 0; i < 3; i++) {
            uint256 idx = uint256(keccak256(abi.encodePacked(seed, i))) % validators.length;
            // Tránh vướng trùng lặp đơn giản (trong demo)
            while (contains(indices, i, idx)) {
                idx = (idx + 1) % validators.length;
            }
            indices[i] = idx;
            result[i] = validators[idx];
        }
        
        return result;
    }

    function contains(uint256[] memory arr, uint256 len, uint256 val) internal pure returns (bool) {
        for (uint i = 0; i < len; i++) {
            if (arr[i] == val) return true;
        }
        return false;
    }

    function getValidatorsCount() external view returns (uint256) {
        return validators.length;
    }
}
