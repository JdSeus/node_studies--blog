const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database")

const CategoriesController = require("./categories/CategoriesController");
const ArticlesController = require("./articles/ArticlesController");
const UsersController = require("./users/UsersController");

const Category = require("./categories/Category");
const Article = require("./articles/Article");
const User = require("./users/User");

//View engine
app.set('view engine', 'ejs');

//Static
app.use(express.static('public'));

//Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexao feita com sucesso!");
    })
    .catch((error) => {
        console.log(error);
    })

//////////////////////////////////////////////////////////
//Main

app.use("/", CategoriesController);
app.use("/", ArticlesController);
app.use("/",UsersController);

app.get("/", (req, res) => {
    var limit = 4;
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: limit
    }).then((articles) => {
        Category.findAll().then((categories) => {
            res.render("index", {articles: articles, categories: categories});
        });   
    });
});

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then((article) => {
        if (article != undefined) {
            Category.findAll().then((categories) => {
                res.render("article", {article: article, categories: categories});
            });   
        } else {
            res.redirect("/");
        }
    }).catch( err => {
        res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
            slug:slug
        },
        include: [{model: Article}]
    }).then( (category) => {
        if (category != undefined) {
            Category.findAll().then( (categories) => {
                res.render("index", {articles: category.articles, categories: categories});
            });
        } else {
            res.redirect("/");
        }
    }).catch( (err) => {
        res.redirect("/");
    });


});

app.listen(8000, () => {
    console.log("O servidor esta rodando!");
});