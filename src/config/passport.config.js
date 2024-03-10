import passport from "passport";
import passportLocal from "passport-local";
import userModel from "../services/dao/mongo/models/user.model.js";
import { createHash, isValidPassword } from "../dirname.js";
import GitHubStrategy from 'passport-github2';
import handlebars from "handlebars";
import { PRIVATE_KEY } from "../dirname.js";
import jwtStrategy from 'passport-jwt';
import UserDTO from "../services/dto/users.dto.js";
const localStrategy = passportLocal.Strategy;

const JwtStrategy = jwtStrategy.Strategy;
const ExtractJWT = jwtStrategy.ExtractJwt;

const initializePassport = () => {
    //Estrategia de obtener Token JWT por Cookie:
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]), 
            secretOrKey: PRIVATE_KEY
        }, async (jwt_payload, done) => {
            console.log("Entrando a passport Strategy con JWT.");
            try {
                console.log("JWT obtenido del payload: " + jwt_payload.user.name);
                
                return done(null, jwt_payload.user);
            } catch (error) {
                console.error(error);
                return done(error);
            }
        }
    ));
    //Funciones de Serializacion y Desserializacion
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await userModel.findById(id);
            done(null, user);
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
        }
    });
};

passport.use('register', new localStrategy(
    {
        passReqToCallback: true,
        usernameField: 'email'
    },
    async (req, username, password, done) => {

        const { first_name, last_name, email, age } = req.body;

        try {
            const exist = await userModel.findOne({ email });
            if (exist) {
                console.log("El usuario ya existe");
                return done(null, false);
            }

            const user = {
                first_name,
                last_name,
                email,
                age,
                //se encripta después
                password: createHash(password)
            };

            const result = await userModel.create(user);

            //todo ok
            console.log(result);
            return done(null, result);
        } catch (error) {
            return done("Error registrando usuario: " + error);
        }
    }
));











const cookieExtractor = req => {
    let token = null;
    console.log("Entrando a Cookie Extractor");
    if (req && req.cookies) { //Validamos que exista el request y las cookies.
    console.log("Cookies Encontradas! ");
        
       token = req.cookies['jwtCookieToken'];
       console.log("Token obtenido!");
        
    }
    return token;
};

export default initializePassport;
