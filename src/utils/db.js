import log from './log';

export const addWordToDatabase = (item) => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('collectionWords', 1);

        request.onerror = (event) => {
            log.error('Database error: ' + event.target.errorCode);
            reject(event.target.errorCode);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('items')) {
                db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction('items', 'readwrite');
            const store = tx.objectStore('items');

            const addRequest = store.add(item);

            addRequest.onerror = (event) => {
                console.error('Unable to add item: ', event);
                reject(event.target.error);
            };

            addRequest.onsuccess = () => {
                resolve('Word added successfully!');
            };
        };
    });
};
export const getAllWordsFromDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('collectionWords');

        request.onerror = (event) => {
            log.error('Database error: ' + event.target.errorCode);
            reject(event.target.errorCode);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction('items', 'readonly');
            const store = tx.objectStore('items');

            // 使用 getAll 方法获取所有记录
            const getAllRequest = store.getAll();

            getAllRequest.onerror = (event) => {
                console.error('Unable to retrieve all items: ', event);
                reject(event.target.error);
            };

            getAllRequest.onsuccess = () => {
                // resolve 方法将包含所有记录的数组
                resolve(getAllRequest.result);
            };
        };
    });
};