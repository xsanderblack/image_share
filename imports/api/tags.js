import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Index, MinimongoEngine } from 'meteor/easy:search';

export const Tags = new Mongo.Collection("tags");

// Index for tags search
export const TagsIndex = new Index({
    collection: Tags,
    fields: [ 'tag_name' ],
    engine: new MinimongoEngine(),
});

if (Meteor.isServer) {
  Meteor.publish("tags", function() {
    return Tags.find();
  });
}

Meteor.methods({
    addTag: function(data) {
        if (!Meteor.user()) {return;}
        if (Tags.findOne({tag_name: data.tag_name})) {
            Tags.update(
                { tag_name: data.tag_name },
                { $push: {images_id: data.image_id} }
            );
        } else {
            let id = [];
            id.push(data.image_id);
            Tags.insert({
                tag_name: data.tag_name,
                images_id: id,
                createdOn: new Date(),
            });
        }
    },
    removeTag: function(data) {
        if (!Meteor.user()) {return;}
        Tags.update(
            { images_id: data.image_id },
            { $pull: {images_id: data.image_id} }
        );
    },
});

Tags.allow({
    insert: function(userId, doc) {
        if (Meteor.user() && doc.createdBy === userId) {
            return true;
        } else {
            return false;
        }
    },
});