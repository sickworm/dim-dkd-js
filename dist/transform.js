"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Transform = /** @class */ (function () {
    function Transform(crypto) {
        this.crypto = crypto;
    }
    /**
        Encrypt message content with password(symmetric key)

        :param password: A symmetric key for encrypting message content
        :param members:  If this is a group message, get all members here
        :return: SecureMessage object
     */
    Transform.prototype.encrypt = function (ins, password, members) {
        if (members === void 0) { members = null; }
        var data = this.crypto.encryptContent(ins, ins.content, password).toString('base64');
        var group = null;
        var key = null;
        var keys = null;
        if (!members) {
            key = this.crypto.encryptKey(ins, password, ins.receiver).toString('base64');
            // TODO reused key for contact when key = null?
        }
        else {
            keys = [];
            for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
                var member = members_1[_i];
                var key_1 = this.crypto.encryptKey(ins, password, ins.receiver);
                keys[member] = key_1;
            }
        }
        return Object.assign({ key: key, keys: keys, data: data, group: group }, ins);
    };
    Transform.prototype.decrypt = function (sec, member) {
        if (member === void 0) { member = null; }
        var group = sec.group;
        var key = sec.key;
        if (member) {
            if (!group) {
                group = sec.receiver;
            }
            if (sec.keys) {
                key = sec.keys[member];
            }
        }
        if (!key) {
            throw new TypeError("decrypt key not found: " + JSON.stringify(sec));
        }
        var password = this.crypto.decryptKey(sec, Buffer.from(key, 'base64'), sec.sender, sec.receiver, group);
        var content = this.crypto.decryptContent(sec, Buffer.from(sec.data, 'base64'), password);
        return {
            sender: sec.sender,
            receiver: sec.receiver,
            time: sec.time,
            content: content
        };
    };
    Transform.prototype.sign = function (sec) {
        var signature = this.crypto.sign(sec, Buffer.from(sec.data, 'base64'), sec.sender).toString('base64');
        var meta = null;
        return Object.assign({ signature: signature, meta: meta }, sec);
    };
    Transform.prototype.split = function (sec, members) {
        var secs = [];
        var keys = sec.keys || {};
        sec.keys = null;
        for (var _i = 0, members_2 = members; _i < members_2.length; _i++) {
            var member = members_2[_i];
            var key = keys[member];
            var memberSec = Object.assign({}, sec);
            memberSec.keys = null;
            memberSec.key = key;
            secs.push(memberSec);
        }
        return secs;
    };
    Transform.prototype.trim = function (sec, member) {
        var key = sec.keys && sec.keys[member] || null;
        var keys = null;
        return Object.assign({}, sec, { key: key, keys: keys });
    };
    Transform.prototype.verify = function (rel) {
        if (!this.crypto.verify(rel, Buffer.from(rel.data, 'base64'), Buffer.from(rel.key), rel.sender)) {
            throw new Error("verify signature failed " + rel);
        }
        var sec = Object.assign({}, rel);
        delete sec.signature;
        return sec;
    };
    return Transform;
}());
exports.Transform = Transform;
