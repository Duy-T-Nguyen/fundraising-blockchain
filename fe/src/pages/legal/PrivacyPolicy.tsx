import LegalLayout from '../../layouts/LegalLayout';

const PrivacyPolicy = () => {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 24, 2024">
      <h2>1. Introduction</h2>
      <p>
        Welcome to our Decentralized Fundraising Platform. We respect your privacy and are committed to protecting it. 
        This Privacy Policy explains how we handle your information when you interact with our DApp (Decentralized Application).
      </p>

      <h2>2. Data Collection & Blockchain</h2>
      <p>
        By using this platform, you acknowledge that your <strong>Wallet Address</strong> and any <strong>Transaction Data</strong> (donations, votes, project creation) 
        are recorded on the public blockchain (Ethereum/Sepolia). 
      </p>
      <ul>
        <li><strong>On-chain Data:</strong> Once recorded on the blockchain, this data is immutable and public. We do not have control over this data.</li>
        <li><strong>Off-chain Data:</strong> We may collect temporary session data, IP addresses (for security/DDoS protection logs), and metadata provided during campaign creation (stored on IPFS).</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>
        We use collected information to:
      </p>
      <ul>
        <li>Provide and maintain the platform's core functionalities.</li>
        <li>Calculate donation weights and voting power.</li>
        <li>Verify supplier identities and campaign legitimacy.</li>
        <li>Improve system performance and security.</li>
      </ul>

      <h2>4. Cookies & Local Storage</h2>
      <p>
        We use <strong>Local Storage</strong> to remember your wallet connection state and UI preferences. Unlike traditional cookies, 
        this data remains on your device and is not used for tracking across other websites.
      </p>

      <h2>5. Security</h2>
      <p>
        We implement security measures including SSL encryption and smart contract audits. However, the security of your funds 
        is ultimately dependent on your private key management and the underlying blockchain infrastructure.
      </p>

      <h2>6. Contact Us</h2>
      <p>
        If you have questions about this policy, you can contact us through our official Discord or GitHub repository.
      </p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
