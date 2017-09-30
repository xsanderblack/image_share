import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Images, ImagesIndex } from '../api/collections.js';
import { Tags, TagsIndex } from '../api/tags.js';
import { Galleries, GalleriesIndex } from '../api/galleries.js';

import './body.html';
import './tags.js';
import './galleries.js';

Meteor.subscribe('images');
Meteor.subscribe('userData');

Session.set('imageLimit', 9);

// Load new images with scrolling
$(window).scroll(function(event) {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 300) {
        let scrollTop = $(this).scrollTop();
        if (scrollTop > 0) {
            Session.set('imageLimit', Session.get('imageLimit') + 3);
        }
    }
});

$(window).load(function(event) {
    if ( $(window).width() <= 975 ) {
        Session.set('setOneCol', true);
        Session.set('userSetOneCol', false);
    }
});

$(window).resize(function(event) {
    if ( $(window).width() <= 975 ) {
        Session.set('setOneCol', true);
    } else if ( Session.get('userSetOneCol') === false ) {
        Session.set('setOneCol', false);
    }
});

Template.welcome.helpers({
    username: function() {
        return (Meteor.user()) ? Meteor.user().username : 'anonymous user';
    }
});

Template.navbar.helpers({
    currentUser: function() {
        return (Meteor.user()) ? true : false;
    }
});

Template.search.helpers({
    imagesIndex: () => ImagesIndex,
    inputAttributes: function () {
		return { 'class': 'search-bar', 'autofocus': '', 'placeholder': 'Start searching...' };
    },
    getUser: function(user_id) {
        const user = Meteor.users.findOne({_id: user_id});
        return (user) ? user.username : 'anon';
    }
});

Template.search_tags.helpers({
    tagsIndex: () => TagsIndex,
    inputAttributes: function () {
		return { 'class': 'search-bar', 'autofocus': '', 'placeholder': 'Start searching...' };
    },
    getImage: function(image_id) {
        const image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    }
});

Template.search_galleries.helpers({
    galleriesIndex: () => GalleriesIndex,
    inputAttributes: function () {
		return { 'class': 'search-bar', 'autofocus': '', 'placeholder': 'Start searching...' };
    },
    getUser: function(user_id) {
        const user = Meteor.users.findOne({_id: user_id});
        if (user) return user.username;
    },
    getImage: function(image_id) {
        const image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    }
});

Template.images.helpers({
    images: function() {
        if (Session.get('setPopular')) {
            return Images.find(
                {},
                {
                    sort: {rating: -1, createdOn: -1},
                    limit: Session.get('imageLimit')
                }
            );
        } else {
            const result = Images.find(
                {},
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get('imageLimit')
                }
            );
            let imagesList = [];

            result.forEach((image) => {
                imagesList.push(image._id);
            });
            Session.set('imagesList', imagesList);
            
            return result;
        }
    },
    getUser: function(user_id) {
        const user = Meteor.users.findOne({_id: user_id});
        return (user) ? user.username : 'anon';
    },
    setPopular: function() {
        return Session.get('setPopular') ? true : false;
    },
    setOneCol: function() {
        return Session.get('setOneCol') ? true : false;
    }
});

Template.image.helpers({
    getUser: function(user_id) {
        const user = Meteor.users.findOne({_id: user_id});
        return (user) ? user.username : 'anon';
    },
    tags: (image_id) => {
        return Tags.find({ images_id: image_id });
    },
    galleries: (image_id) => {
        return Galleries.find({ images_id: image_id });
    },
    prev_image: (image_id) => {
        const imagesList = Session.get('imagesList');
        const index = imagesList.indexOf(image_id);
        return (index < 1) ? '#' : '/image/' + imagesList[index - 1];
    },
    next_image: (image_id) => {
        const imagesList = Session.get('imagesList');
        const index = imagesList.indexOf(image_id);
        return (index === (imagesList.length - 1)) ? '#' : '/image/' + imagesList[index + 1];
    }
});

Template.navbar.events({
    'click .js-show-image-form': function(event) {
        $('#image_add_form').modal('show');
    }
});

Template.image_add_form.events({
    'submit .js-add-image': function(event) {
        event.preventDefault();
        
        let img_src, img_title, img_alt, img_copy, tags = [], galleries, aspect_ratio;
        img_src = event.target.img_src.value;
        img_title = event.target.img_title.value;
        img_alt = event.target.img_alt.value;
        img_copy = event.target.img_copy.value;
        tags = event.target.tags.value.split(' ');
        galleries = event.target.galleries.value.split(' ');

        let imgObg = new Image();
        imgObg.src = img_src;
        aspect_ratio = (imgObg.width >= imgObg.height) ? 'landscape' : 'portrait';
        
        Meteor.call('addImage', {img_src, img_title, img_alt, img_copy, tags, galleries, aspect_ratio}, function(error, result) {
            let image_id = result;

            for (let i = 0; i < tags.length; i++) {
                let tag_name = tags[i];
                Meteor.call('addTag', {tag_name, image_id});
            }
            
            for (let i = 0; i < galleries.length; i++) {
                let gallerie_name = galleries[i];
                Meteor.call('addGallerie', {gallerie_name, image_id});
            }
        });
        
        $('#image_add_form').modal('hide');
    }
});

Template.images.events({
    'click .js-rate-image': function(event) {
        const rating = $(event.currentTarget).data('userrating');
        const image_id = this.id;
        Meteor.call('rateImage', {image_id: image_id, rating: rating});
    },
    'click .js-set-popular': function(event) {
        Session.set('setPopular', true);
        $('li.js-unset-popular').removeClass('active');
        $('li.js-set-popular').addClass('active');
    },
    'click .js-unset-popular': function(event) {
        Session.set('setPopular', false);
        $('li.js-set-popular').removeClass('active');
        $('li.js-unset-popular').addClass('active');
    },
    'click .js-one-col': function(event) {
        Session.set('setOneCol', true);
        Session.set('userSetOneCol', true);
    },
    'click .js-three-col': function(event) {
        Session.set('setOneCol', false);
        Session.set('userSetOneCol', false);
    }
});