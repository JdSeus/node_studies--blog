const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database")

const CategoriesController = require("./categories/CategoriesController");
const ArticlesController = require("./articles/ArticlesController");

const Category = require("./categories/Category");
const Article = require("./articles/Article");

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

app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ]
    }).then((articles) => {
        res.render("index", {articles: articles});
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
            res.render("article", {article: article});
        } else {
            res.redirect("/");
        }
    }).catch( err => {
        res.redirect("/");
    });
});

app.listen(8000, () => {
    console.log("O servidor esta rodando!");
});