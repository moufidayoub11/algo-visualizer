// Initialize modules
const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const fs = require("fs");
const path = require("path");
const babel = require("gulp-babel");
const terser = require("gulp-terser");
const browsersync = require("browser-sync").create();

function jsTask(cb) {
    const jsFiles = getJSFiles("app/js");
    let tasks = [];

    jsFiles.forEach((filePath) => {
        let dist = filePath.replace("app/js", "dist");

        let distDir = path.dirname(dist);

        tasks.push(
            src(filePath, { sourcemaps: true })
                .pipe(babel())
                .pipe(terser())
                .pipe(dest(distDir, { sourcemaps: "." }))
        );
    });

    cb();
    return tasks;
}

function getJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getJSFiles(filePath, fileList);
        } else {
            if (path.extname(file) === ".js") {
                fileList.push(filePath);
            }
        }
    }
    return fileList;
}

// Sass Task
function scssTask() {
    return src("app/scss/style.scss", { sourcemaps: true })
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(dest("dist", { sourcemaps: "." }));
}

// Browsersync
function browserSyncServe(cb) {
    browsersync.init({
        server: {
            baseDir: ".",
        },
        notify: {
            styles: {
                top: "auto",
                bottom: "0",
            },
        },
    });
    cb();
}
function browserSyncReload(cb) {
    browsersync.reload();
    cb();
}

// Watch Task
function watchTask() {
    watch("*.html", browserSyncReload);
    watch(
        ["app/scss/**/*.scss", "app/**/*.js"],
        series(scssTask, jsTask, browserSyncReload)
    );
}

// Default Gulp Task
exports.default = series(scssTask, jsTask, browserSyncServe, watchTask);
