import User from './models/user';

class BXRest {
    constructor() {
        this.domain = '';
        this.cache = {};
        this.resizeTimestamp = 0;
        this.scrollSize = {};
        this.initComplete = false;
        this.placementInformation = false;
        //this.local = !false;
    }

    appCache(key, value) {
        if (typeof value === 'undefined') {
            return this.cache[key];
        }
        this.cache[key] = value;
    }

    clearCacheDocument(id) {
        this.appCache(CacheType.KeyForDocument(id), null);
    }

    clearCacheUser(id) {
        this.appCache(CacheType.KeyForUser(id), null);
    }

    installComplete() {
        const BX24 = window.BX24 || false;
        if (!BX24)
            return;

        BX24.installFinish();
    }

    getDomain() {
        return this.domain;
    }

    getLang() {
        return this.lang === 'ru' ? 'ru' : 'en';
    }

    isInitComplete() {
        return this.initComplete;
    }

    getAuth() {
        const BX24 = window.BX24 || false;
        if (!BX24)
            return;
        return BX24.getAuth();
    }

    init() {
        const _ = this;
        return new Promise((resolve, reject) => {
            const BX24 = window.BX24 || false;
            if (BX24) {
                BX24.init(function () {
                    _.initComplete = true;
                    _.domain = BX24.getDomain();
                    _.lang = BX24.getLang();
                    _.placementInformation = BX24.placement.info();
                    BX24.callMethod('user.current', {}, function (result) {
                        if (result.error()) {
                            console.error('error-get-current-user', result.error());
                            reject();
                        }
                        else {
                            const user = new User(result.data(), BX24.isAdmin());
                            resolve(user);
                        }
                    });
                });
            }
            else {
                reject();
            }
        })
    }

    resizeFrame() {
        const _ = this;
        const timestamp = new Date().getTime();
        this.resizeTimestamp = timestamp;
        setTimeout(function () {
            _.tryResize(timestamp);
        }, 300);
    }

    tryResize(timestamp) {
        const BX24 = window.BX24 || false;
        if (!BX24)
            return;
        const _ = this;
        if (_.resizeTimestamp === timestamp) {
            BX24.fitWindow();
        }
    }


    callBatch(batchData, callback) {
        const BX24 = window.BX24 || false;
        if (!BX24)
            return;
        BX24.callBatch(batchData, function (result) {
            callback(result);
        });
    }

    prepareResult(items, data) {
        if (Array.isArray(data)) {
            data.forEach((item) => {
                items.push(item);
            });
            return;
        }
        if (data.documents && Array.isArray(data.documents)) {
            data.documents.forEach((item) => {
                items.push(item);
            });
            return;
        }
        items.push(data);
    }

    callMethod(method, requestData = {}, all = false) {
        const _ = this;
        return new Promise((resolve, reject) => {
            const BX24 = window.BX24 || false;
            if (!BX24) {
                reject();
                return;
            }
            const items = [];
            BX24.callMethod(method, requestData, (result) => {
                if (result.error()) {
                    reject(result.error());
                }
                else {
                    const data = result.data();
                    _.prepareResult(items, data);
                    if (!all) {
                        resolve({ items: items, total: result.total() });
                    }
                    else {
                        if (result.more()) {
                            result.next();
                        }
                        else {
                            resolve({ items: items });
                        }
                    }
                }
            });
        })
    }

    scrollParentWindow(offset = 0) {
        const BX24 = window.BX24 || false;
        if (!BX24) {
            return;
        }
        BX24.scrollParentWindow(offset);
    }

    placementInfo() {
        return this.placementInformation;
    }

    removePlacementOption(key) {//todo
        delete this.placementInformation.options[key];
    }
    
    getUsers(ids) {
        const _ = this;
        return new Promise((resolve, reject) => {
            ids = ids.filter(x => x > 0);
            var arEntities = {};
            const arFind = [];
            ids.forEach((id) => {
                var entity = _.appCache(CacheType.KeyForUser(id));
                if (entity) {
                    arEntities[id] = entity;
                } else {
                    arFind.push(id);
                }
            });

            if (arFind.length < 1) {
                resolve(arEntities);
                return;
            }
            _.callMethod('user.get', { 'ID': arFind }, true).then((result) => {
                result.items.forEach(item => {
                    const entity = new User(item, Rest.getDomain());
                    _.appCache(CacheType.KeyForUser(entity.Id), entity);
                    arEntities[entity.Id] = entity;
                });
                resolve(arEntities);
            }).catch(err => {
                reject(err);
            });
        });
    }
}

class CacheType {
    static KeyForUser(id) {
        return `User_${id}`;
    }

    static KeyForDocument(id) {
        return `Document_${id}`;
    }
}

export const Rest = new BXRest();