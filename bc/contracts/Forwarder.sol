// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @title Forwarder
 * @notice Hợp đồng điều phối (Forwarder) cho Meta-Transactions theo chuẩn EIP-2771.
 * @dev Cho phép Relayer (hoặc AI Bot) gửi giao dịch thay cho người dùng sau khi đã kiểm tra chữ ký.
 *      Hỗ trợ Batching (gom nhiều giao dịch vào một mẻ) để tối ưu Gas.
 */
contract Forwarder is EIP712 {
    using ECDSA for bytes32;

    struct ForwardRequest {
        address from;
        address to;
        uint256 value;
        uint256 gas;
        uint256 nonce;
        bytes data;
    }

    bytes32 private constant _FORWARD_REQUEST_TYPEHASH =
        keccak256("ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data)");

    mapping(address => uint256) private _nonces;

    constructor() EIP712("FundraisingForwarder", "1") {}

    function getNonce(address from) public view returns (uint256) {
        return _nonces[from];
    }

    function verify(ForwardRequest calldata req, bytes calldata signature) public view returns (bool) {
        address signer = _hashTypedDataV4(
            keccak256(abi.encode(_FORWARD_REQUEST_TYPEHASH, req.from, req.to, req.value, req.gas, req.nonce, keccak256(req.data)))
        ).recover(signature);
        return _nonces[req.from] == req.nonce && signer == req.from;
    }

    function execute(ForwardRequest calldata req, bytes calldata signature) public payable returns (bool, bytes memory) {
        require(verify(req, signature), "Forwarder: signature mismatch or nonce expired");
        _nonces[req.from]++;

        (bool success, bytes memory returndata) = req.to.call{gas: req.gas, value: req.value}(
            abi.encodePacked(req.data, req.from)
        );

        if (!success) {
            // Trả về lỗi nếu call thất bại
            assembly {
                revert(add(returndata, 32), mload(returndata))
            }
        }

        return (success, returndata);
    }

    /**
     * @notice Thực thi hàng loạt các yêu cầu (Batching) để tối ưu phí Gas Base.
     */
    function executeBatch(ForwardRequest[] calldata reqs, bytes[] calldata signatures) external payable {
        require(reqs.length == signatures.length, "Forwarder: length mismatch");
        for (uint256 i = 0; i < reqs.length; i++) {
            execute(reqs[i], signatures[i]);
        }
    }
}
