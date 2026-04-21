import { encodePacked, keccak256 } from 'viem';

/**
 * Tạo hash thông điệp để Verifier ký xác nhận giao hàng.
 * @param campaignAddress Địa chỉ hợp đồng Campaign
 * @param requestIndex Chỉ số Request trong mảng requests
 * @param milestoneIndex Chỉ số giai đoạn (nếu là MULTI), nếu không truyền thì mặc định là "FINAL" cho SINGLE
 */
export const hashVerificationMessage = (
  campaignAddress: `0x${string}`,
  requestIndex: number,
  milestoneIndex?: number
) => {
  if (milestoneIndex !== undefined) {
    // Luồng MULTI: abi.encodePacked(address(this), index, current)
    return keccak256(
      encodePacked(
        ['address', 'uint256', 'uint256'],
        [campaignAddress, BigInt(requestIndex), BigInt(milestoneIndex)]
      )
    );
  } else {
    // Luồng SINGLE: abi.encodePacked(address(this), index, "FINAL")
    return keccak256(
      encodePacked(
        ['address', 'uint256', 'string'],
        [campaignAddress, BigInt(requestIndex), "FINAL"]
      )
    );
  }
};
