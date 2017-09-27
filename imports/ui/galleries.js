import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Galleries } from '../api/galleries.js';
import { Images } from '../api/collections.js';

import './galleries.html';

Meteor.subscribe("galleries");
Meteor.subscribe("images");
Meteor.subscribe('userData');

Session.set("gallerieLimit", 12);
Session.set("imageLimit", 9);
Session.set("userLimit", 12);
Session.setDefault("userPhotoNew", true);

Template.galleries.helpers({
    galleries: function() {
        return Galleries.find(
                { images_id: { $ne: [] } },
                {
                    sort: { createdOn: -1 },
                    limit: Session.get( "gallerieLimit" )
                }
            );
    },
    getUser: function(user_id) {
        let user = Meteor.users.findOne({_id: user_id});
        if (user) return user.username;
    },
    getImage: function(image_id) {
        let image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    },
});

Template.gallerie.helpers({
    images: function(images_id) {
        if ( Session.get("setPopularGalOne") ) {
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
    setPopularGalOne: function() {
        return Session.get("setPopularGalOne") ? true : false;
    },
    setOneCol: function() {
        return Session.get( "setOneCol" ) ? true : false;
    },
    canEdit: function() {
        if (this.createdBy === Meteor.userId()) {
            return true;
        } else {
            return false;
        }
    }
});

Template.users.helpers({
    users: function() {
        return Meteor.users.find(
                {},
                {
                    sort: { createdOn: -1 },
                    limit: Session.get( "userLimit" )
                }
            );
    }
});

Template.user_top.helpers({
    photos_count: function(_id) {
        return Images.find({ createdBy: _id }).count();
    },
    setPhotos: () => ( Router.current().route.getName() === "users.:user_id.photos" ),
    setGalleries: () => ( Router.current().route.getName() ===  "users.:user_id.galleries" )
});

Template.photos_by_user.helpers({
    images: function(user_id) {
        if ( Session.get("userPhotoNew") ) {
            return Images.find(
                {
                    createdBy: user_id
                },
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get("imageLimit")
                }
            );
        } else if ( Session.get("userPhotoPopular") ) {
            return Images.find(
                {
                    createdBy: user_id
                },
                {
                    sort: {rating: -1, createdOn: -1},
                    limit: Session.get("imageLimit")
                }
            );
        } else if ( Session.get("userPhotoPrivate") ) {
            return Images.find(
                {
                    createdBy: user_id,
                    isSelected: true
                },
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get("imageLimit")
                }
            );
        }
    },
    userPhotoNew: function() {
        return Session.get("userPhotoNew") ? true : false;
    },
    userPhotoPopular: function() {
        return Session.get("userPhotoPopular") ? true : false;
    },
    userPhotoPrivate: function() {
        return Session.get("userPhotoPrivate") ? true : false;
    },
    setOneCol: function() {
        return Session.get( "setOneCol" ) ? true : false;
    },
    canEdit: function() {
        if (this.createdBy === Meteor.userId()) {
            return true;
        } else {
            return false;
        }
    },
    canEditUser: ( user_id ) => ( user_id === Meteor.userId() )
});

Template.galleries_by_user.helpers({
    galleries: function(user_id) {
        return Galleries.find(
                {
                    images_id: { $ne: [] },
                    createdBy: user_id
                },
                {
                    sort: { createdOn: -1 },
                    limit: Session.get( "gallerieLimit" )
                }
            );
    },
    getImage: function(image_id) {
        let image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    },
});

Template.gallerie.events({
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
        Session.set("setPopularGalOne", true);
        $("li.js-unset-popular").removeClass("active");
        $("li.js-set-popular").addClass("active");
    },
    "click .js-unset-popular": function(event) {
        Session.set("setPopularGalOne", false);
        $("li.js-set-popular").removeClass("active");
        $("li.js-unset-popular").addClass("active");
    },
    "click .js-one-col": function(event) {
        Session.set("setOneCol", true);
        Session.set("userSetOneCol", true);
    },
    "click .js-three-col": function(event) {
        Session.set("setOneCol", false);
        Session.set("userSetOneCol", false);
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

Template.photos_by_user.events({
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
    "click .js-set-new": function(event) {
        Session.set("userPhotoNew", true);
        Session.set("userPhotoPopular", false);
        Session.set("userPhotoPrivate", false);
    },
    "click .js-set-popular": function(event) {
        Session.set("userPhotoNew", false);
        Session.set("userPhotoPopular", true);
        Session.set("userPhotoPrivate", false);
    },
    "click .js-set-private": function(event) {
        Session.set("userPhotoNew", false);
        Session.set("userPhotoPopular", false);
        Session.set("userPhotoPrivate", true);
    },
    "click .js-one-col": function(event) {
        Session.set("setOneCol", true);
        Session.set("userSetOneCol", true);
    },
    "click .js-three-col": function(event) {
        Session.set("setOneCol", false);
        Session.set("userSetOneCol", false);
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