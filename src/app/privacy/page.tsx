export default function Privacy() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Privacy Policy for NutriSnap</h1>
      <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
      
      <h2>Information We Collect</h2>
      <p>NutriSnap processes food images to provide nutrition analysis. Images are sent to OpenAI's servers for analysis and are not stored by us.</p>
      
      <h2>How We Use Information</h2>
      <p>Food images are analyzed using AI to provide nutritional information. No personal data is collected or stored.</p>
      
      <h2>Third-Party Services</h2>
      <p>We use OpenAI's GPT-4 Vision API to analyze food images. Please see OpenAI's privacy policy for more information.</p>
      
      <h2>Contact Us</h2>
      <p>If you have questions about this privacy policy, contact us at: [your-email@example.com]</p>
    </div>
  );
}
