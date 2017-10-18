import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

import './main.html';

Template.main.onCreated(function onCreated() {
    // counter starts at 0
    this.show_direct_pay = new ReactiveVar(true);
});

Template.main.helpers({
    show_direct_pay() {
        return Template.instance().show_direct_pay.get();
    },
});

Template.main.events({
    'click .nav-tabs>li'(event, instance) {
        let role = instance.$(event.currentTarget).attr('role');
        console.log(role)
        if(role == 'old') {
            instance.show_direct_pay.set(true);
        } else if(role == 'new') {
            instance.show_direct_pay.set(false);
        }
    },
});
