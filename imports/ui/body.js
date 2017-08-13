import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Images, ImagesIndex } from '../api/collections.js';
import { Tags } from '../api/tags.js';
import { Galleries } from '../api/galleries.js';

import './body.html';
import './tags.js';
import './galleries.js';

Meteor.subscribe("images");
Meteor.subscribe('userData');

Session.set("imageLimit", 9);

var lastScrollTop = 0;
$(window).scroll(function(event) {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
        var scrollTop = $(this).scrollTop();
        if (scrollTop > lastScrollTop) {
            Session.set("imageLimit", Session.get("imageLimit") + 3);
        }
    }
});

Template.images.helpers({
    images: function() {
        // check if some user selected, if no - show all
        if ( Session.get("userFilter") ) {
            return Images.find(
                {createdBy: Session.get("userFilter")},
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get("imageLimit")
                });
        } else if ( Session.get("setPopular") ) {
            return Images.find(
                {},
                {
                    sort: {rating: -1, createdOn: -1},
                    limit: Session.get("imageLimit")
                }
            );
        } else {
            return Images.find(
                {},
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
    setPopular: function() {
        return Session.get("setPopular") ? true : false;
    },
    setOneCol: function() {
        return Session.get( "setOneCol" ) ? true : false;
    },
    filtering_images: function() {
        return Session.get("userFilter") ? true : false;
    },
    getFilterUser: function() {
        if (Session.get("userFilter")) {
            var user = Meteor.users.findOne({_id: Session.get("userFilter")});
            return user.username;
        } else {
            return "anon";
        }
    },
    canEdit: function() {
        if (this.createdBy === Meteor.userId()) {
            return true;
        } else {
            return false;
        }
    }
});

Template.image.helpers({
    getUser: function(user_id) {
        var user = Meteor.users.findOne({_id: user_id});
        if (user) {
            return user.username;
        } else {
            return "anon";
        }
    },
    tags: (image_id) => {
        return Tags.find({ images_id: image_id });
    },
    galleries: (image_id) => {
        return Galleries.find({ images_id: image_id });
    }
});

Template.welcome.helpers({
    username: function() {
        if (Meteor.user()) {
            return Meteor.user().username;
        } else {
            return "anonymous user";
        }
    }
});

Template.navbar.helpers({
    currentUser: function() {
        if (Meteor.user()) {
            return true;
        } else {
            return false;
        }
    },
    imagesIndex: () => ImagesIndex,
});

Template.searchBox.helpers({
    imagesIndex: () => ImagesIndex,
});

Template.navbar.events({
    "click .js-show-image-form": function(event) {
        $("#image_add_form").modal("show");
    },
});

Template.images.events({
    "click .js-image": function(event) {
//        $(event.target).css("width", "50px");
    },
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
        Session.set("setPopular", true);
        $("li.js-unset-popular").removeClass("active");
        $("li.js-set-popular").addClass("active");
    },
    "click .js-unset-popular": function(event) {
        Session.set("setPopular", false);
        $("li.js-set-popular").removeClass("active");
        $("li.js-unset-popular").addClass("active");
    },
    "click .js-one-col": function(event) {
        Session.set("setOneCol", true);
    },
    "click .js-three-col": function(event) {
        Session.set("setOneCol", false);
    },
    "click .js-set-image-filter": function(event) {
        Session.set("userFilter", this.createdBy);
    },
    "click .js-unset-image-filter": function(event) {
        Session.set("userFilter", undefined);
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

Template.image_add_form.events({
    "submit .js-add-image": function(event) {
        event.preventDefault();
        
        let img_src, img_title, img_alt, img_copy, tags = [], galleries;
        img_src = event.target.img_src.value;
        img_title = event.target.img_title.value;
        img_alt = event.target.img_alt.value;
        img_copy = event.target.img_copy.value;
        tags = event.target.tags.value.split(" ");
        galleries = event.target.galleries.value.split(" ");
        
        Meteor.call("addImage", {img_src, img_title, img_alt, img_copy, tags, galleries}, function(error, result) {
            let image_id = result;

            for (let i = 0; i < tags.length; i++) {
                let tag_name = tags[i];
                Meteor.call("addTag", {tag_name, image_id});
            }
            
            for (let i = 0; i < galleries.length; i++) {
                let gallerie_name = galleries[i];
                Meteor.call("addGallerie", {gallerie_name, image_id});
            }
        });
        
        $("#image_add_form").modal("hide");
    }
});