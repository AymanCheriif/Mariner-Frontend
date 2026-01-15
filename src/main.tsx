import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from '~i18n';
import { LocalizationProvider, MuiThemeProvider, QueryClientProvider } from '~providers';
import { routes } from '~routes';
import '~styles/index.css';
import '~styles/reset.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider>
			<I18nProvider>
				<LocalizationProvider>
					<MuiThemeProvider>{routes}</MuiThemeProvider>
				</LocalizationProvider>
			</I18nProvider>
		</QueryClientProvider>
	</React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event: unknown, message: string) => {
	console.log(message);
});
