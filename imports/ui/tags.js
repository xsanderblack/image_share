import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Tags } from '../api/tags.js';
import { Images } from '../api/collections.js';

import './tags.html';

Meteor.subscribe("tags");
Meteor.subscribe("images");
Meteor.subscribe('userData');

Session.set("tagLimit", 12);
Session.set("imageLimit", 9);

Template.tags.helpers({
    tags: function() {
        return Tags.find(
                { images_id: { $ne: [] } },
                {
                    sort: { createdOn: -1 },
                    limit: Session.get( "tagLimit" )
                }
            );
    },
    getImage: function(image_id) {
        let image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    },
    setPopularTag: function() {
        return Session.get("setPopularTag") ? true : false;
    }
});

Template.tags.events({
    "click .js-set-popular": function(event) {
        Session.set("setPopularTag", true);
    },
    "click .js-unset-popular": function(event) {
        Session.set("setPopularTag", false);
    }
});

Template.tag.helpers({
    images: function(images_id) {
        if ( Session.get("setPopularTagOne") ) {
            return Images.find(
                {
                    _id: { $in: images_id }
                },
                {
                    sort: {rating: -1, createdOn: -1},
                    limit: Session.get("imageLimit")
                }
            );
        } else {
            return Images.find(
                {
                    _id: { $in: images_id }
                },
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get("imageLimit")
                }
            );
        }
    },
    getUser: function(user_id) {
        var user = Meteor.users.findOne({_id: user_id});
        if (user) {
            return user.username;
        } else {
            return "anon";
        }
    },
    setPopularTagOne: function() {
        return Session.get("setPopularTagOne") ? true : false;
    },
    setOneColTagOne: function() {
        return Session.get( "setOneColTagOne" ) ? true : false;
    },
    canEdit: function() {
        if (this.createdBy === Meteor.userId()) {
            return true;
        } else {
            return false;
        }
    }
});

Template.tag.events({
    "click .js-del-image": function(event) {
        var image_id = this._id;
        $("#" + image_id).hide("slow", function() {
            Meteor.call("removeImage", {image_id: image_id});
            Meteor.call("removeTag", {image_id});
            Meteor.call("removeGallerie", {image_id});
        });
    },
    "click .js-rate-image": function(event) {
        var rating = $(event.currentTarget).data("userrating");
        var image_id = this.id;
        Meteor.call("rateImage", {image_id: image_id, rating: rating});
    },
    "click .js-set-popular": function(event) {
        Session.set("setPopularTagOne", true);
        $("li.js-unset-popular").removeClass("active");
        $("li.js-set-popular").addClass("active");
    },
    "click .js-unset-popular": function(event) {
        Session.set("setPopularTagOne", false);
        $("li.js-set-popular").removeClass("active");
        $("li.js-unset-popular").addClass("active");
    },
    "click .js-one-col": function(event) {
        Session.set("setOneColTagOne", true);
    },
    "click .js-three-col": function(event) {
        Session.set("setOneColTagOne", false);
    },
    "click .js-select-image": function(event) {
        var image_id = this._id;
        if (event.target.checked) {
            $("#" + image_id + " .thumbnail").addClass("selected-image");
            Meteor.call("selectImage", {image_id: image_id});
        } else {
            $("#" + image_id + " .thumbnail").removeClass("selected-image");
            Meteor.call("unselectImage", {image_id: image_id});
        }
    }
});