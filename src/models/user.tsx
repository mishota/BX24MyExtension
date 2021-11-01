import React from "react";
import { Rest } from "../rest";
import DefaultAvatar from '../images/user-default-avatar.svg';

class User {
    id: number;
    NAME: string = '';
    LAST_NAME: string = '';
    SECOND_NAME: string = '';
    EMAIL: string = '';
    PERSONAL_PHOTO: string = '';
    WORK_POSITION: string = '';
    PERSONAL_MOBILE: string = '';
    admin: boolean = false;
    constructor(fields: any, admin: boolean = false) {
        Object.assign(this, fields);
        this.id = parseInt(fields?.ID ?? fields?.id) || 0;
        this.admin = admin;
    }

    get Id(): number {
        return this.id;
    }

    get Link(): string {
        return `https://${Rest.getDomain()}/company/personal/user/${this.Id}/`;
    }

    get LinkView() {
        const user = this;
        return (
            <a href={user.Link} target="_blank" title={user.FullName}>
                {user.Photo
                    ? <span className="tasks-grid-avatar" style={{ backgroundImage: `url(${user.Photo})` }}></span>
                    : <span className="tasks-grid-avatar bg-dark" style={{ backgroundImage: `url(${DefaultAvatar})` }}></span>
                }
                {user.FullName}
            </a>
        );
    }

    get LinkIconView() {
        const user = this;
        return (
            <a href={user.Link} target="_blank" title={user.FullName}>
                {user.Photo
                    ? <span className="tasks-grid-avatar" style={{ backgroundImage: `url(${user.Photo})` }}></span>
                    : <span className="tasks-grid-avatar bg-dark" style={{ backgroundImage: `url(${DefaultAvatar})` }}></span>
                }
            </a>
        );
    }

    get Photo() {
        return this.PERSONAL_PHOTO && this.PERSONAL_PHOTO.length > 0 ? this.PERSONAL_PHOTO : false;
    }

    get Position() {
        return this.WORK_POSITION;
    }

    get FullName() {
        if (this.NAME && this.NAME.length > 0) {
            if (this.LAST_NAME && this.LAST_NAME.length > 0) {
                return this.NAME + ' ' + this.LAST_NAME;
            }
            return this.NAME;
        }

        if (this.EMAIL && this.EMAIL.length > 0)
            return this.EMAIL;

        return 'ID: ' + this.Id;
    }

    get isAdmin(): boolean {
        return this.admin;
    }
}

export default User;