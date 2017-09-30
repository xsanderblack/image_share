import { Meteor } from 'meteor/meteor';

import '../imports/api/collections.js';
import '../imports/api/tags.js';
import '../imports/api/galleries.js';

import { Galleries } from '../imports/api/galleries.js';
import { Images } from '../imports/api/collections.js';
import { Tags } from '../imports/api/tags.js';

Meteor.startup(() => {
    // if (Images.find().count() === 0) {
    //     for (var i=1; i<23; i++) {
    //         Images.insert({
    //             img_src: "img_" + i + ".jpg",
    //             img_title: "Image " + i,
    //             img_alt: "Description for image " + i,
    //             img_copy: "Creater of image" + i,
    //             createdOn: new Date(),
    //             createdBy: "id", // !!!
    //             tags: ["tag"],
    //             galleries: ["gallerie"],
    //             isSelected: false,
    //         });
    //     }
    // }
    console.log(Images.find().count());
});

// Publish user names to everyone
Meteor.publish('userData', function () {
    return Meteor.users.find({}, {
        fields: { username: 1 }
    });
});