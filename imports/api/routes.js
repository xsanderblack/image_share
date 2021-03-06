import { Meteor } from 'meteor/meteor';
import { Images } from '../api/collections.js';
import { Tags } from '../api/tags.js';
import { Galleries } from '../api/galleries.js';

Router.configure({
    layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
    this.render('welcome', {
        to: 'main'
    });
});

Router.route('/explore', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('images', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/image/:_id', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('image', {
        to: 'main',
        data: function() {
            return Images.findOne({ _id: this.params._id });
        }
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/tags', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('tags', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/tags/:_id', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('tag', {
        to: 'main',
        data: function() {
            return Tags.findOne({ _id: this.params._id });
        }
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/galleries', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('galleries', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/users/:user_id/galleries', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('user_top', {
        to: 'profile',
        data: function() {
            return Meteor.users.findOne({ _id: this.params.user_id });
        }
    });
    this.render('galleries_by_user', {
        to: 'main',
        data: function() {
            return Meteor.users.findOne({ _id: this.params.user_id });
        }
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/users/:user_id/photos', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('user_top', {
        to: 'profile',
        data: function() {
            return Meteor.users.findOne({ _id: this.params.user_id });
        }
    });
    this.render('photos_by_user', {
        to: 'main',
        data: function() {
            return Meteor.users.findOne({ _id: this.params.user_id });
        }
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/users/:user_id/galleries/:gallerie_name', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('gallerie', {
        to: 'main',
        data: function() {
            return Galleries.findOne({
                createdBy: this.params.user_id,
                gallerie_name: this.params.gallerie_name,
            });
        }
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/users', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('users', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/search', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('search', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/search_tags', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('search_tags', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});

Router.route('/search_galleries', function () {
    this.render('image_add_form', {
        to: 'helper'
    });
    this.render('navbar', {
        to: 'navbar'
    });
    this.render('search_galleries', {
        to: 'main'
    });
    this.render('footer', {
        to: 'footer'
    });
});