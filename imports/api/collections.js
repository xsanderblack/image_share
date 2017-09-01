import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine } from 'meteor/easy:search';

export const Images = new Mongo.Collection("images");

// Index for images search
export const ImagesIndex = new Index({
    collection: Images,
    fields: [ 'img_title', 'img_alt' ],
    engine: new MinimongoEngine(),
});

if (Meteor.isServer) {
  Meteor.publish("images", function() {
    return Images.find({
      $or: [
        {isSelected: false},
        {createdBy: this.userId}
      ]
    });
  });
}

Meteor.methods({
    addImage: function(data) {
        if (!Meteor.user()) {return;}
        return Images.insert({
            img_src: data.img_src,
            img_title: data.img_title,
            img_alt: data.img_alt,
            img_copy: data.img_copy,
            createdOn: new Date(),
            createdBy: Meteor.user()._id,
            tags: data.tags,
            galleries: data.galleries,
            isSelected: false,
        });
    },
    removeImage: function(data) {
        Images.remove({"_id": data.image_id});
    },
    rateImage: function(data) {
        Images.update({_id: data.image_id}, {$set: {rating: data.rating}});
    },
    selectImage: function(data) {
        if (!Meteor.user()) {return;}
        Images.update({_id: data.image_id}, {$set: {isSelected: true}});
    },
    unselectImage: function(data) {
        if (!Meteor.user()) {return;}
        Images.update({_id: data.image_id}, {$set: {isSelected: false}});
    }
});

Images.allow({
    insert: function(userId, doc) {
        if (Meteor.user() && doc.createdBy === userId) {
            return true;
        } else {
            return false;
        }
    },
    remove: function(userId, doc) {
        if (Meteor.user() && doc.createdBy === userId) {
            return true;
        } else {
            return false;
        }
    },
    update: function(userId, doc) {
        if (Meteor.user() && doc.createdBy === userId) {
            return true;
        } else {
            return false;
        }
    }
});