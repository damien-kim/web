// https://www.npmjs.com/package/lowdb
// lowdb 사용을 위해 아래 iimport들이 모두 필요함 
import { join } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Use JSON file for storage
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 이 코드가 실행되는 폴더에 'db.json'을 생성함, auth.mjs의 경우 ~/node/routes/db.json
const file = join(__dirname, 'db.json')

const adapter = new JSONFile(file)
const db = new Low(adapter)
await db.read();

//users라는 이름의 db초기화
db.data ||= { users: [] }
//entry생성
db.data.users.push({
    email:'damien@gg.com',
    password: 'damien',
    dispalyName: 'damienGim'
})
// db.json에 쓰기
await db.write();


// passport 인증 처리를 위한 library
// lowdb lightweight database
// bcrypt : 비밀 번호를 hash하는 library
