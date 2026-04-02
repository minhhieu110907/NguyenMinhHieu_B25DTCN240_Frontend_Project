import { users as sampleUsers } from "./data_sample.js";
import { getUser, saveUser } from "./storage.js";

function initData() {
    let localUsers = getUser();

    // nếu chưa có user nào → dùng data mẫu
    if (localUsers.length === 0) {
        saveUser(sampleUsers);
        return;
    }

    //  merge: thêm user mẫu nếu chưa tồn tại
    let mergedUsers = [...localUsers];

    sampleUsers.forEach(function (sampleUser) {
        let exist = mergedUsers.find(function (u) {
            return u.email === sampleUser.email;
        });

        if (!exist) {
            mergedUsers.push(sampleUser);
        }
    });

    saveUser(mergedUsers);
}

initData();