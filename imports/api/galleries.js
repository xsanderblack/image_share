import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine } from 'meteor/easy:search';

export const Galleries = new Mongo.Collection("galleries");

// Index for galleries search
export const GalleriesIndex = new Index({
    collection: Galleries,
    fields: [ 'gallerie_name' ],
    engine: new MinimongoEngine(),
});

if (Meteor.isServer) {
  Meteor.publish("galleries", function() {
    return Galleries.find();
  });
}

Meteor.methods({
    addGallerie: function(data) {
        if (!Meteor.user()) {return;}
        if (Galleries.findOne({ gallerie_name: data.gallerie_name, createdBy: Meteor.user()._id })) {
            Galleries.update(
                {
                    gallerie_name: data.gallerie_name,
                    createdBy: Meteor.user()._id
                },
                { $push: {images_id: data.image_id} }
            );
        } else {
            let id = [];
            id.push(data.image_id);
            Galleries.insert({
                gallerie_name: data.gallerie_name,
                images_id: id,
                createdOn: new Date(),
                createdBy: Meteor.user()._id,
            });
        }
    },
    removeGallerie: function(data) {
        if (!Meteor.user()) {return;}
        Galleries.update(
            {
                images_id: data.image_id,
                createdBy: Meteor.user()._id
            },
            { $pull: {images_id: data.image_id} }
        );
    },
});

Galleries.allow({
    insert: function(userId, doc) {
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