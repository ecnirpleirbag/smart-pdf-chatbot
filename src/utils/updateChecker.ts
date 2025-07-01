import { version } from '../../package.json';

interface ReleaseInfo {
  tag_name: string;
  html_url: string;
  body: string;
}

export async function checkForUpdates(): Promise<{ hasUpdate: boolean; updateInfo?: ReleaseInfo }> {
  try {
    const response = await fetch('https://api.github.com/repos/ecnirpleirbag/smart-pdf-chatbot/releases/latest');
    if (!response.ok) throw new Error('Failed to fetch release info');
    
    const latestRelease: ReleaseInfo = await response.json();
    const currentVersion = version;
    const latestVersion = latestRelease.tag_name.replace('v', '');
    
    // Compare versions
    const hasUpdate = latestVersion > currentVersion;
    
    return {
      hasUpdate,
      updateInfo: hasUpdate ? latestRelease : undefined
    };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { hasUpdate: false };
  }
}

export function showUpdateNotification(updateInfo: ReleaseInfo) {
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
  notification.innerHTML = `
    <h3 class="font-bold mb-2">New Update Available!</h3>
    <p class="mb-2">Version ${updateInfo.tag_name} is now available.</p>
    <div class="flex gap-2">
      <a href="${updateInfo.html_url}" target="_blank" 
         class="bg-white text-blue-500 px-4 py-2 rounded hover:bg-blue-50">
        Download Update
      </a>
      <button onclick="this.parentElement.parentElement.remove()" 
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Later
      </button>
    </div>
  `;
  document.body.appendChild(notification);
} 