import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Tags } from '../api/tags.js';
import { Images } from '../api/collections.js';

import './tags.html';

Meteor.subscribe('tags');
Meteor.subscribe('images');
Meteor.subscribe('userData');

Session.set('tagLimit', 12);
Session.set('imageLimit', 9);

Template.tags.helpers({
    tags: function() {
        return Tags.find(
                { images_id: { $ne: [] } },
                {
                    sort: { createdOn: -1 },
                    limit: Session.get( 'tagLimit' )
                }
            );
    },
    getImage: function(image_id) {
        const image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    }
});

Template.tag.helpers({
    images: function(images_id) {
        if ( Session.get('setPopularTagOne') ) {
            return Images.find(
                {
                    _id: { $in: images_id }
                },
                {
                    sort: {rating: -1, createdOn: -1},
                    limit: Session.get('imageLimit')
                }
            );
        } else {
            return Images.find(
                {
                    _id: { $in: images_id }
                },
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get('imageLimit')
                }
            );
        }
    },
    getUser: function(user_id) {
        const user = Meteor.users.findOne({_id: user_id});
        return (user) ? user.username : 'anon';
    },
    setPopularTagOne: function() {
        return Session.get('setPopularTagOne') ? true : false;
    },
    setOneCol: function() {
        return Session.get('setOneCol') ? true : false;
    }
});

Template.tag.events({
    'click .js-rate-image': function(event) {
        const rating = $(event.currentTarget).data('userrating');
        const image_id = this.id;
        Meteor.call('rateImage', {image_id: image_id, rating: rating});
    },
    'click .js-set-popular': function(event) {
        Session.set('setPopularTagOne', true);
        $('li.js-unset-popular').removeClass('active');
        $('li.js-set-popular').addClass('active');
    },
    'click .js-unset-popular': function(event) {
        Session.set('setPopularTagOne', false);
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