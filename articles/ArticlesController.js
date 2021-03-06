const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/articles", adminAuth,(req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then( (articles) => {
        res.render("admin/articles/index", {articles: articles});
    }); 
});

router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
});

router.post("/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId:  category
    }).then(() => {
        res.redirect("/admin/articles");
    });
});

router.post("/articles/delete", adminAuth, (req, res) => {
    var id = req.body.id;
    if (id != undefined) {
        if (!isNaN(id)) {
            Article.destroy({
                where:{
                    id:id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            });
        } else { //Se o id não for um número
            res.redirect("/admin/articles");
        }
    } else { // Se o id for nulo
        res.redirect("/admin/articles");
    }
});

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    Article.findByPk(id).then((article) => {
        if (article != undefined) {
            Category.findAll().then( (categories) => {
                res.render("admin/articles/edit", {categories: categories, article: article});
            })
        } else {
            res.redirect("/");
        }
    }).catch ((err) => {
        res.redirect("/");
    });
});

router.post("/articles/update", adminAuth, (req,res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Article.update({title: title, body: body, categoryId: category, slug: slugify(title)}, {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(err => {
        res.redirect("/")
    });
});

router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var next = false;
    var previous = false;
    var numberpages;
    var offset = 0;
    var limit = 4;
    if (isNaN(page) || page == 1) {
        offset = 0;
    } else {
        offset = (parseInt(page) * limit) - limit;
    }
    Article.findAndCountAll({
        order: [
            ['id', 'DESC']
        ],
        limit: limit,
        offset: offset
    }).then((articles) => {

        if (offset + limit >= articles.count) {
            next = false;
        } else {
            next = true;
        }

        if (page > 1) {
            previous = true;
        } else {
            previous = false;
        }

        numberpages = Math.ceil(articles.count / limit);

        var pagination = {
            page: parseInt(page),
            next: next,
            previous: previous,
            numberpages: numberpages,
            articles: articles,
        }
        Category.findAll().then((categories) => {
            res.render("admin/articles/page",{pagination: pagination, categories: categories});
        }); 
    });
});

module.exports = router;
