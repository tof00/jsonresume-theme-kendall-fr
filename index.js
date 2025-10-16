const fs = require('fs');
const _ = require('lodash');
const gravatar = require('gravatar');
const Mustache = require('mustache');
const dayjs = require('dayjs');
require('dayjs/locale/fr'); // charger la locale française

dayjs.locale('fr'); // définir la locale par défaut

function formatDate(dateStr) {
    if (!dateStr) return 'Présent';
    const date = dayjs(dateStr);
    return `${date.format('MMMM')} ${date.format('YYYY')}`; // ex: "Octobre 2025"
}

function render(resumeObject) {

    resumeObject.basics.capitalName = resumeObject.basics.name.toUpperCase();

    if (resumeObject.basics && resumeObject.basics.email) {
        resumeObject.basics.gravatar = gravatar.url(resumeObject.basics.email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });
    }

    resumeObject.photo = resumeObject.basics.image || resumeObject.basics.gravatar;

    _.each(resumeObject.basics.profiles, function(p){
        const icons = {
            'google-plus': 'fab fa-google-plus',
            flickr: 'fab fa-flickr',
            dribbble: 'fab fa-dribbble',
            codepen: 'fab fa-codepen',
            soundcloud: 'fab fa-soundcloud',
            reddit: 'fab fa-reddit',
            tumblr: 'fab fa-tumblr',
            'stack-overflow': 'fab fa-stack-overflow',
            blog: 'fas fa-rss',
            rss: 'fas fa-rss',
            gitlab: 'fab fa-gitlab',
            keybase: 'fas fa-key'
        };
        p.iconClass = icons[p.network.toLowerCase()] || 'fab fa-' + p.network.toLowerCase();
        p.text = p.url || `${p.network}: ${p.username}`;
    });

    function formatPeriod(entry) {
        if (entry.startDate) {
            entry.startDateFormatted = formatDate(entry.startDate);
        }
        entry.endDateFormatted = entry.endDate ? formatDate(entry.endDate) : 'Présent';
        if (entry.highlights && entry.highlights[0]) {
            entry.boolHighlights = entry.highlights[0] !== '';
        }
    }

    ['work', 'volunteer'].forEach(section => {
        if (resumeObject[section] && resumeObject[section].length) {
            resumeObject[`${section}Bool`] = true;
            _.each(resumeObject[section], formatPeriod);
        }
    });

    ['projects', 'skills', 'interests', 'languages', 'references'].forEach(section => {
        if (resumeObject[section] && resumeObject[section].length && resumeObject[section][0].name) {
            resumeObject[`${section}Bool`] = true;
        }
    });

    if (resumeObject.education && resumeObject.education.length) {
        resumeObject.educationBool = true;
        _.each(resumeObject.education, function(e){
            e.educationDetail = (e.area || '') + (e.studyType ? ', ' + e.studyType : '');
            e.startDateFormatted = e.startDate ? formatDate(e.startDate) : '';
            e.endDateFormatted = e.endDate ? formatDate(e.endDate) : 'Présent';
            if (e.courses && e.courses[0] && e.courses[0] !== '') {
                e.educationCourses = true;
            }
        });
    }

    if (resumeObject.awards && resumeObject.awards.length) {
        resumeObject.awardsBool = true;
        _.each(resumeObject.awards, function(a){
            const d = a.date ? dayjs(a.date) : null;
            a.dateFormatted = d ? `${d.format('DD')} ${d.format('MMMM')} ${d.format('YYYY')}` : '';
        });
    }

    if (resumeObject.publications && resumeObject.publications.length) {
        resumeObject.publicationsBool = true;
        _.each(resumeObject.publications, function(p){
            const d = p.releaseDate ? dayjs(p.releaseDate) : null;
            p.dateFormatted = d ? `${d.format('DD')} ${d.format('MMMM')} ${d.format('YYYY')}` : '';
        });
    }

    resumeObject.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
    resumeObject.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
    const theme = fs.readFileSync(__dirname + '/resume.template', 'utf8');
    const resumeHTML = Mustache.render(theme, resumeObject);

    return resumeHTML;
}

module.exports = {
    render
};
