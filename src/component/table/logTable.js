import { Trans } from 'react-i18next';
import { Link } from "react-router-dom";
import { DataStorage } from "../../enum/dataStorage";
import { Rest } from "../../rest";
import TableComponent from './tableComponent';
import Log from '../../models/log';
import { LinkService } from '../../service/linkService';

class LogTable extends TableComponent {

    constructor() {
        super();
        this.Id = 'log-table-component';
        this.state.sortBy = 'id';
        this.state.visibleColumns = ['property_type', 'property_user', 'property_date'];
        const currentDefinition = this;

        this.Header.push({
            text_id: 'field-id',
            field: 'id',
            sortable: true,
            getCellObject: function (item) {
                return (<td className="align-middle">{item.ID}</td>);
            }
        });

        this.Header.push({
            text_id: 'field-event-type',
            field: 'property_type',
            getCellObject: function (item) {
                const link = LinkService.get(item.ObjectType, item.ObjectId);
                return (
                    <td className="align-middle">
                        {item.Type.indexOf('delete') < 0 && link
                            ? <Link to={link}><Trans>log-{item.Type}</Trans></Link>
                            : <span><Trans>log-{item.Type}</Trans></span>}
                    </td>
                );
            }
        });

        this.Header.push({
            text_id: 'field-object-id',
            field: 'property_object_id',
            //sortable: true,
            getCellObject: function (item) {
                return (
                    <td className="align-middle">
                        {item.ObjectId}
                    </td>
                );
            }
        });

        this.Header.push({
            text_id: 'field-description',
            field: 'property_description',
            //sortable: true,
            getCellObject: function (item) {
                return (
                    <td className="align-middle">
                        {item.Description}
                    </td>
                );
            }
        });

        this.Header.push({
            text_id: 'field-user',
            field: 'property_user',
            getCellObject: function (item) {
                return (
                    <td className="align-middle">
                        {item.User &&
                            item.User.LinkView
                        }
                    </td>
                );
            }
        });

        this.Header.push({
            text_id: 'field-date',
            field: 'property_date',
            sortable: true,
            getCellObject: function (item) {
                return (
                    <td className="align-middle">
                        {item.Date.format('L LTS')}
                    </td>
                );
            }
        });

    }

    loadData = async () => {
        const currentDefinition = this;
        const sortBy = currentDefinition.state.sortBy.toUpperCase();
        const sortOrder = currentDefinition.state.sortOrder.toUpperCase();
        var requestData = {
            ENTITY: DataStorage.log,
            SORT: {},
            filter: {},
            start: currentDefinition.getOffset()
            //take: currentDefinition.getStep()
        };
        requestData.SORT[sortBy] = sortOrder;
        currentDefinition.applyFilter(requestData.filter);

        try {
            const result = await Rest.callMethod('entity.item.get', requestData);
            const items = result.items.map(x => new Log(x));
            const userIds = [];
            items.forEach((item) => {
                if (!userIds.includes(item.UserId)) {
                    userIds.push(item.UserId);
                }
            });
            const users = await Rest.getUsers(userIds);
            items.forEach(item => {
                if (users[item.UserId]) {
                    item.User = users[item.UserId];
                }
            });
            currentDefinition.printRows(items, result.total);
        }
        catch (err) {
            currentDefinition.loadDataError(err);
        }
        finally {
            currentDefinition.loadDataAlways();
        }
        
    }

}

export default LogTable;