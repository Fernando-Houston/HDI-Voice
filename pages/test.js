export default function Test() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Houston Voice AI - Test Page</h1>
      <p>If you can see this, Next.js is working!</p>
      <p>Environment variables:</p>
      <ul style={{ listStyle: 'none' }}>
        <li>HDI API URL: {process.env.NEXT_PUBLIC_HDI_API_URL || 'NOT SET'}</li>
        <li>Voice ID: {process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'NOT SET'}</li>
      </ul>
    </div>
  );
}