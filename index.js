const fs = require('fs');
const _ = require('lodash');
const gravatar = require('gravatar');
const Mustache = require('mustache');

const monthsFR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function getMonthFR(dateStr) {
  if (!dateStr || dateStr.length < 7) return '';
  const monthIndex = parseInt(dateStr.substr(5,2), 10) - 1;
  return monthsFR[monthIndex] || '';
}

function formatDateFR(dateStr) {
  if (!dateStr) return 'Présent';
  const year = dateStr.substr(0,4);
  const month = getMonthFR(dateStr);
  return month ? `${month} ${year}` : year;
}

function render(resume) {
  const curYear = new Date().getFullYear();

  // Basics
  resume.basics.capitalName = resume.basics.name.toUpperCase();
  if (resume.basics.email) {
    resume.basics.gravatar = gravatar.url(resume.basics.email, { s:'200', r:'pg', d:'mm' });
  }
  resume.photo = resume.basics.image || resume.basics.gravatar || '';

  // Profiles icons
  _.each(resume.basics.profiles || [], function(p){
    const icons = {
      "google-plus":"fab fa-google-plus",
      "flickr":"fab fa-flickr",
      "dribbble":"fab fa-dribbble",
      "codepen":"fab fa-codepen",
      "soundcloud":"fab fa-soundcloud",
      "reddit":"fab fa-reddit",
      "tumblr":"fab fa-tumblr",
      "stack-overflow":"fab fa-stack-overflow",
      "blog":"fas fa-rss",
      "rss":"fas fa-rss",
      "gitlab":"fab fa-gitlab",
      "keybase":"fas fa-key"
    };
    p.iconClass = icons[p.network.toLowerCase()] || `fab fa-${p.network.toLowerCase()}`;
    p.text = p.url || `${p.network}: ${p.username}`;
  });

  // Helper pour travail, bénévolat, éducation, etc.
  function processItems(items) {
    _.each(items || [], item => {
      item.startDateFormatted = formatDateFR(item.startDate);
      item.endDateFormatted = formatDateFR(item.endDate);
      if (item.endDate && parseInt(item.endDate.substr(0,4)) > curYear) {
        item.endDateFormatted += " (prévu)";
      }
      if (item.highlights && item.highlights.length > 0 && item.highlights[0] !== "") {
        item.boolHighlights = true;
      }
      if (item.courses && item.courses.length > 0 && item.courses[0] !== "") {
        item.educationCourses = true;
      }
    });
  }

  resume.workBool = resume.work && resume.work.length > 0;
  resume.volunteerBool = resume.volunteer && resume.volunteer.length > 0;
  resume.projectsBool = resume.projects && resume.projects.length > 0 && resume.projects[0].name;
  resume.educationBool = resume.education && resume.education.length > 0 && resume.education[0].institution;
  resume.awardsBool = resume.awards && resume.awards.length > 0 && resume.awards[0].title;
  resume.publicationsBool = resume.publications && resume.publications.length > 0 && resume.publications[0].name;
  resume.skillsBool = resume.skills && resume.skills.length > 0 && resume.skills[0].name;
  resume.interestsBool = resume.interests && resume.interests.length > 0 && resume.interests[0].name;
  resume.languagesBool = resume.languages && resume.languages.length > 0 && resume.languages[0].language;
  resume.referencesBool = resume.references && resume.references.length > 0 && resume.references[0].name;

  processItems(resume.work);
  processItems(resume.volunteer);
  processItems(resume.education);
  processItems(resume.awards);
  processItems(resume.publications);

  resume.css = fs.readFileSync(__dirname + "/style.css", "utf-8");
  resume.printcss = fs.readFileSync(__dirname + "/print.css", "utf-8");
  const template = fs.readFileSync(__dirname + "/resume.template", "utf-8");

  return Mustache.render(template, resume);
}

module.exports = { render };
