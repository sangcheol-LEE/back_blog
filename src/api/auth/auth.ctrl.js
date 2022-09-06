import Joi from "joi";
import User from '../../models/user'

// 회원가입
// POST /api/auth/ register
/* 
  username : 'ian',
  password : "qwert1234"
*/
export const register = async ctx => {
  const schema = Joi.object().keys({
    username : Joi.string()
      .alphanum()
      .min(3)
      .max(20)
      .required(),
      password : Joi.string().required(),
  });
  const result = schema.validate(ctx.request.body);
  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { username, password } = ctx.request.body;
  try {
    const exists = await User.findByUsername(username);
    if(exists) {
      ctx.status = 409;
      return ;
    }

    const user = new User({
      username,
    })
    await user.setPassword(password);
    await user.save();

    const data = user.toJSON();
    delete data.hashedPassword;
    ctx.body = user.serialize();

    const token = user.generateToken();
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly : true
    });
  } catch(e) {
    ctx.throw(500,e)
  }
};

  // 로그인
/* POST /api/auth/login 
  {
    username : "ian",
    password : "pass1234"
  }
*/
export const login = async ctx => {
  const {username , password} = ctx.request.body;

  //username, password 없으면 에러처리
  if(!username || !password) {
    ctx.status = 401;
    return;
  }

  try {
    const user = await User.findByUsername(username);

    if(!user){
      ctx.status = 401;
      return;
    }
    const valid = await user.checkPassword(password);

    if(!valid) {
      ctx.status = 401;
      return;
    }

    ctx.body = user.serialize();
    const token = user.generateToken();
    ctx.cookies.set("access_token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      httpOnly : true
    });
  }catch(e) {
    ctx.throw(500,e);
  }
}

export const check = async ctx => {
  // 로그인 상태 확인
}

export const logout = async ctx => {
  // 로그아웃
}