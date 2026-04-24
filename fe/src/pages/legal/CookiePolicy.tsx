import LegalLayout from '../../layouts/LegalLayout';

const CookiePolicy = () => {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="April 24, 2024">
      <h2>1. About Cookies</h2>
      <p>
        Cookies are small text files stored on your device. In our DApp, we prioritize your privacy and minimize 
        the use of tracking technologies.
      </p>

      <h2>2. Technologies We Use</h2>
      <ul>
        <li><strong>Local Storage:</strong> We use your browser's local storage to save your wallet connection preference (e.g., connected/disconnected state) and theme settings. This data never leaves your device.</li>
        <li><strong>Session Storage:</strong> Temporary data used during your current visit to ensure smooth navigation between campaigns and dashboards.</li>
        <li><strong>No Third-Party Tracking:</strong> We do not use third-party cookies for advertising or cross-site tracking.</li>
      </ul>

      <h2>3. Purpose of Data Storage</h2>
      <p>
        The data we store locally is essential for:
      </p>
      <ul>
        <li>Maintaining your session with MetaMask or other wallet providers.</li>
        <li>Saving your UI preferences (e.g., language or display modes).</li>
        <li>Improving the loading speed of recently viewed campaigns.</li>
      </ul>

      <h2>4. Managing Your Preferences</h2>
      <p>
        Since we use browser-native storage (Local/Session Storage), you can clear this data at any time by:
      </p>
      <ol>
        <li>Opening your browser's settings.</li>
        <li>Navigating to "Clear Browsing Data" or "Site Settings".</li>
        <li>Selecting "Cookies and other site data".</li>
      </ol>
      <p>
        Note: Clearing this data will disconnect your wallet from the interface (though your funds remain safe in your wallet).
      </p>
    </LegalLayout>
  );
};

export default CookiePolicy;
