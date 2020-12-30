const router = require("express").Router();
const { User } = require("../model/User");
const { auth } = require("../util/auth");

const async = require("async");
const Crawl = require("../model/Crawl");
const { main } = require("../crawler/scrap");

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        enroll: req.body.enroll,
        isAuth: true,
    });
});

router.post("/register", async (req, res) => {
    let body = {
        enroll: req.body.enroll,
        password: req.body.password,
    };

    main(body.enroll, body.password)
        .then((pg) => {
            if (!pg)
                return res.status(403).json({
                    success: false,
                    msg: "Invalid credentials provided!",
                });
            body["pages"] = pg;
            const user = new User(body);
            User.findOne({ enroll: req.body.enroll }, (err, _user) => {
                if (_user) {
                    return res
                        .status(200)
                        .json({ success: false, msg: "User Already Exist! " });
                }

                user.save((err, doc) => {
                    if (err)
                        return res.json({
                            success: false,
                            err,
                            msg: "Yes iam",
                        });

                    return res.status(200).json({
                        success: true,
                    });
                });
            });
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                err,
                msg: "Some Server Error Please try Again Later!",
            });
        });
});

router.post("/login", (req, res) => {
    User.findOne({ enroll: req.body.enroll }, (err, user) => {
        if (!user)
            return res.json({
                loginSuccess: false,
                message: "Auth failed, enroll not found",
            });

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({
                    loginSuccess: false,
                    message: "Wrong password",
                });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                req.session.w_auth = user.token;
                res.status(200).json({
                    loginSuccess: true,
                    userId: user._id,
                });
            });
        });
    });
});

router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate(
        { _id: req.user._id },
        { token: "", tokenExp: "" },
        (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true,
            });
        },
    );
});

module.exports = router;
