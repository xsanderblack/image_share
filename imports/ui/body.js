import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { Images, ImagesIndex } from '../api/collections.js';
import { Tags, TagsIndex } from '../api/tags.js';
import { Galleries, GalleriesIndex } from '../api/galleries.js';

import './body.html';
import './tags.js';
import './galleries.js';

Meteor.subscribe("images");
Meteor.subscribe('userData');

Session.set("imageLimit", 9);

var lastScrollTop = 0;
$(window).scroll(function(event) {
    if ($(window).scrollTop() + $(window).height() > $(document).height() - 300) {
        var scrollTop = $(this).scrollTop();
        if (scrollTop > lastScrollTop) {
            Session.set("imageLimit", Session.get("imageLimit") + 3);
        }
    }
});

$(window).load(function(event) {
    if ( $(window).width() <= 975 ) {
        Session.set("setOneCol", true);
        Session.set("userSetOneCol", false);
    }
});

$(window).resize(function(event) {
    if ( $(window).width() <= 975 ) {
        Session.set("setOneCol", true);
    } else if ( Session.get("userSetOneCol") === false ) {
        Session.set("setOneCol", false);
    }
});

Template.images.onCreated(function() {
    this.autorun(() => {
        this.subscribe('images');
    });
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
            const result = Images.find(
                {},
                {
                    sort: {createdOn: -1, rating: -1},
                    limit: Session.get("imageLimit")
                }
            );
            let imagesList = [];

            result.forEach((image) => {
                imagesList.push(image._id);
            });
            Session.set("imagesList", imagesList);
            
            return result;
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
    },
    prev_image: (image_id) => {
        const imagesList = Session.get("imagesList");
        const index = imagesList.indexOf(image_id);
        return (index < 1) ? "#" : "/image/" + imagesList[index - 1];
    },
    next_image: (image_id) => {
        const imagesList = Session.get("imagesList");
        const index = imagesList.indexOf(image_id);
        return ( index === (imagesList.length - 1) ) ? "#" : "/image/" + imagesList[index + 1];
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
    }
});

Template.search.helpers({
    imagesIndex: () => ImagesIndex,
    inputAttributes: function () {
		return { 'class': 'search-bar', 'autofocus': '', 'placeholder': 'Start searching...' };
    },
    getUser: function(user_id) {
        var user = Meteor.users.findOne({_id: user_id});
        if (user) {
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

Template.search_tags.helpers({
    tagsIndex: () => TagsIndex,
    inputAttributes: function () {
		return { 'class': 'search-bar', 'autofocus': '', 'placeholder': 'Start searching...' };
    },
    getImage: function(image_id) {
        let image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    }
});

Template.search_galleries.helpers({
    galleriesIndex: () => GalleriesIndex,
    inputAttributes: function () {
		return { 'class': 'search-bar', 'autofocus': '', 'placeholder': 'Start searching...' };
    },
    getUser: function(user_id) {
        let user = Meteor.users.findOne({_id: user_id});
        if (user) return user.username;
    },
    getImage: function(image_id) {
        let image = Images.findOne({_id: image_id});
        if (image) return image.img_src;
    }
});

Template.navbar.events({
    "click .js-show-image-form": function(event) {
        $("#image_add_form").modal("show");
    }
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
        Session.set("userSetOneCol", true);
    },
    "click .js-three-col": function(event) {
        Session.set("setOneCol", false);
        Session.set("userSetOneCol", false);
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
        
        let img_src, img_title, img_alt, img_copy, tags = [], galleries, aspect_ratio;
        img_src = event.target.img_src.value;
        img_title = event.target.img_title.value;
        img_alt = event.target.img_alt.value;
        img_copy = event.target.img_copy.value;
        tags = event.target.tags.value.split(" ");
        galleries = event.target.galleries.value.split(" ");

        let imgObg = new Image();
        imgObg.src = img_src;
        aspect_ratio = (imgObg.width >= imgObg.height) ? "landscape" : "portrait";
        
        Meteor.call("addImage", {img_src, img_title, img_alt, img_copy, tags, galleries, aspect_ratio}, function(error, result) {
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