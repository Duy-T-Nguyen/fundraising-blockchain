import LegalLayout from '../../layouts/LegalLayout';

const TermsOfService = () => {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="April 24, 2024">
      <h2>1. Acceptance of Terms</h2>
      <p>
        By connecting your wallet and using this platform, you agree to these Terms of Service. If you do not agree, 
        please do not interact with our smart contracts or interface.
      </p>

      <h2>2. Nature of Service</h2>
      <p>
        This is a <strong>Decentralized Application (DApp)</strong>. We provide the interface to interact with autonomous smart contracts 
        deployed on the Ethereum network. We do not hold your private keys, nor do we have the power to reverse transactions.
      </p>

      <h2>3. User Responsibility</h2>
      <ul>
        <li><strong>Wallet Security:</strong> You are solely responsible for maintaining the security of your private keys and seed phrases.</li>
        <li><strong>Compliance:</strong> You must comply with all local laws regarding cryptocurrency and fundraising in your jurisdiction.</li>
        <li><strong>Accuracy:</strong> Campaign managers must provide truthful information and legitimate proofs for milestone payouts.</li>
      </ul>

      <h2>4. Smart Contract Risks</h2>
      <p>
        Interacting with smart contracts involves inherent risks, including potential bugs, exploits, or network congestion. 
        The software is provided <strong>"AS IS"</strong> without warranty of any kind.
      </p>

      <h2>5. Prohibited Activities</h2>
      <p>
        You agree not to use the platform for:
      </p>
      <ul>
        <li>Money laundering or financing illegal activities.</li>
        <li>Creating fraudulent or misleading fundraising campaigns.</li>
        <li>Exploiting technical vulnerabilities in the smart contracts or UI.</li>
      </ul>

      <h2>6. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, we shall not be liable for any loss of funds, crypto-assets, 
        or data resulting from your use of the platform, blockchain network issues, or price volatility.
      </p>

      <h2>7. Modifications</h2>
      <p>
        We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance.
      </p>
    </LegalLayout>
  );
};

export default TermsOfService;
