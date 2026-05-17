import { ipcMain, safeStorage } from "electron";
import Store from "electron-store"

const store = new Store({
    name: 'user-preferences',
    defaults: {
        encryptedToken: null
    }
});

export const getusertoken = (): string | null => {
  try {
    const hexToken = store.get('encryptedToken') as string | null;

    if (!hexToken) return null;

    const buffer = Buffer.from(hexToken, 'hex');
    return safeStorage.decryptString(buffer);
  } catch (error) {
    console.error("Internal Token Read Error:", error);
    return null;
  }
};

export const Auth = () => {
    ipcMain.on('savetoken', (_, token) => {
        try {
            if (!safeStorage.isEncryptionAvailable()) return;

            const encryptedBuffer = safeStorage.encryptString(token);

            store.set('encryptedToken', encryptedBuffer.toString('hex'));
        } catch (error) {
            console.error("Save Error:", error);
        }
    });


    ipcMain.handle('gettoken', () => {
        try {
            const hexToken = store.get('encryptedToken') as string | null;

            if (!hexToken) return null;

            const buffer = Buffer.from(hexToken, 'hex');
            return safeStorage.decryptString(buffer);
        } catch (error) {
            console.error("Read Error:", error);
            return null;
        }
    });

    ipcMain.on('logout', () => {
        try {
            store.delete('encryptedToken');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    });


}
