import { join } from 'path';
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import _ from 'lodash';
import { title } from 'process';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
export const db = new Low(adapter)

await db.read();     // JSONFile and JSONFileSync adapters will set db.data to null if file doesn't exist.
db.data ||= { users: [], topics: [] } // Set default data
export const usersDb = db.data.users;
export const topicsDb = db.data.topics;
// db.data.users.push({
//     id: shortid.generate(),
//     email: 'nostril@gmail.com',
//     password: 'nostril',
//     dispalyName: 'nostril'
// })
// db.write();

export function dbUser(email) {
    const arr = Object.entries(db.data.users);
    let i = 0;
    let obj;
    while (i < arr.length) {
        if (obj = arr[i].find(x => x.email === email)) {
            break;
        }
        i++;
    }
    return obj; // object itself 
}

export function dbId(id) {
    const arr = Object.entries(db.data.users);
    let i = 0;
    let obj;
    while (i < arr.length) {
        if (obj = arr[i].find(x => x.id === id)) {
            break;
        }
        i++;
    }
    return obj;
}



export function jsonFunc(id, dbType){
    const arr = Object.entries(dbType);
    let i = 0;
    while (i < arr.length) {
        if (arr[i].find(x => x.id === id)) {
            break;
        }
        i = i + 1; 
    }
    return i;
}

// export function topicNum(id) {
//     const arr = Object.entries(db.data.topics);
//    let i = 0;
//     let obj;
//     while (i < arr.length) {
//         if (obj = arr[i].find(x => x.id === id)) {
//             break;
//         }
//         i++;
//     }
//     return i;
// }


// export default users;
//console.log(user.value()) // list all entries in the db.json

// codes below is to find user entry
// const arr = Object.entries(userdb.users);
// let i = 0;
// while (i < arr.length) {
//     if (arr[i].find(x => x.password === 'nostril')) {
//         break;
//     }
//     i++;
// }
