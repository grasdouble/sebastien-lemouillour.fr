import { useTranslation } from 'react-i18next';

import { ChatInterface } from './components/ChatInterface';

import './i18n';

function App() {
  const { t } = useTranslation('ai-chatbot');

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>{t('chatbot.title')}</h1>
        <p>{t('chatbot.subtitle')}</p>
      </header>

      <main>
        <ChatInterface />
      </main>
    </div>
  );
}

export default App;
