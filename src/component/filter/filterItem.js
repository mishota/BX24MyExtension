class FilterItem {
    constructor(type, name, title, additionalParams){
        this.Type = type;
        this.Name = name;
        this.Title = title;
        this.ContainerClassName = '';
        if(additionalParams){
            let keys = Object.keys(additionalParams);
            for(let i in keys){
                let key = keys[i];
                this[key] = additionalParams[key];
            }
        }
    }
}

export default FilterItem;