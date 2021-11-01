class TableStyle {
    constructor() {
        this.default = 'default';
        this.block = 'block';
        this.smallBlock = 'smallblock';
    }

    getList(excludes) {
        const result = [
            { id: this.default, icon: 'fas fa-bars' },
            { id: this.block, icon: 'fas fa-th-large' },
            { id: this.smallBlock, icon: 'fas fa-th' }
        ];
        if(excludes) {
            return result.filter(x => !excludes.includes(x.id));
        }
        return result;
    }
}

export default new TableStyle();