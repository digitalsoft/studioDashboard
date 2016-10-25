import {
    Component,
    Input,
    ViewChild,
    EventEmitter,
    Output,
    ChangeDetectorRef
} from "@angular/core";
import {AdnetCustomerModel} from "../../../../adnet/AdnetCustomerModel";
import {AdnetPairModel} from "../../../../adnet/AdnetPairModel";
import {List} from "immutable";
import {AdnetPackageModel} from "../../../../adnet/AdnetPackageModel";
import {AppStore} from "angular2-redux-util";
import {
    SimpleList,
    ISimpleListItem
} from "../../../simplelist/Simplelist";
import {
    AdnetNetworkPropSelector,
    IAdNetworkPropSelectedEvent
} from "./AdnetNetwork";
import {AdnetTargetModel} from "../../../../adnet/AdnetTargetModel";
import {Lib} from "../../../../Lib";
import {AdnetActions} from "../../../../adnet/AdnetActions";
import * as _ from 'lodash';
import * as bootbox from "bootbox";
import {TreeNode} from 'primeng/primeng';

//import AdnetNetworkPackageEditorTemplate from './AdnetNetworkPackageEditor.html!text'; /*prod*/
//import AdnetNetworkPackageEditorStyle from './AdnetNetworkPackageEditor.css!text'; /*prod*/

@Component({
//	styles: [AdnetNetworkPackageEditorStyle], /*prod*/
//	template: AdnetNetworkPackageEditorTemplate, /*prod*/
    selector: 'AdnetNetworkPackageEditor',
    templateUrl: './AdnetNetworkPackageEditor.html', /*dev*/
    styleUrls: ['./AdnetNetworkPackageEditor.css'], /*dev*/
    moduleId: __moduleName
})

export class AdnetNetworkPackageEditor {

    constructor(private appStore: AppStore, private adnetAction:AdnetActions, private cd:ChangeDetectorRef) {
        this['me'] = Lib.GetCompSelector(this.constructor)
    }

    ngOnInit() {
        this.packages = this.appStore.getState().adnet.getIn(['packages']) || {};
        this.unsub = this.appStore.sub((i_adPackages: List<AdnetPackageModel>) => {
            this.packages = i_adPackages;
            this.onFilterPackages();
        }, 'adnet.packages');
        this.onFilterPackages();
    }

    @ViewChild(SimpleList) simpleList: SimpleList;

    @Input()
    set setPairOutgoing(i_setPairOutgoing: boolean) {
        this.pairOutgoing = i_setPairOutgoing;
        if (this.pairOutgoing == true)
            this.onFilterPackages();
    }

    @Input()
    set setAdnetCustomerModel(i_adnetCustomerModel: AdnetCustomerModel) {
        this.adnetCustomerModel = i_adnetCustomerModel;
        this.onFilterPackages();
    }

    @Input() setAdnetPairModels: List<AdnetPairModel>

    @Output() onPropSelected: EventEmitter<IAdNetworkPropSelectedEvent> = new EventEmitter<IAdNetworkPropSelectedEvent>();

    @Output() onAdnetPacakgedSelected: EventEmitter<AdnetPackageModel> = new EventEmitter<AdnetPackageModel>();

    @Output() onAdnetTargetsSelected: EventEmitter<List<AdnetTargetModel>> = new EventEmitter<List<AdnetTargetModel>>();


    private unsub: Function;
    private adnetCustomerModel: AdnetCustomerModel;
    private packages: List<AdnetPackageModel>
    private packagesFiltered: List<AdnetPackageModel>
    private pairOutgoing: boolean;
    public selectedAdnetPackageModel: AdnetPackageModel;
    //public selectedAdnetTargetModels: List<AdnetTargetModel>;

    private onAdd(event) {
        var id = this.adnetCustomerModel.customerId();
        this.appStore.dispatch(this.adnetAction.addAdnetPackages(id));
    }

    private onRemove(event) {
        if (!this.selectedAdnetPackageModel) return;
        bootbox.confirm({
            message: "are you sure you want to delete this adnet packages?",
            callback: (result) => {
                if (!result)
                    return;
                this.appStore.dispatch(this.adnetAction.removeAdnetPackage(this.selectedAdnetPackageModel.getId(), this.adnetCustomerModel.customerId()));
                this.selectedAdnetPackageModel = null;
            }
        });
    }

    private processAdnetPackageField(i_function: string) {
        return (i_adnetPackageModel: AdnetPackageModel) => {
            return i_adnetPackageModel[i_function]();
        }
    }

    private onFilterPackages() {
        if (!this.packages || !this.adnetCustomerModel)
            return;
        this.packagesFiltered = List<AdnetPackageModel>();
        this.packages.forEach((i_package: AdnetPackageModel) => {
            if (i_package.getCustomerId() == this.adnetCustomerModel.getId())
                this.packagesFiltered = this.packagesFiltered.push(i_package);
        })
        this.cd.markForCheck();
    }

    private getId(i_adnetPackageModel: AdnetPackageModel) {
        if (!i_adnetPackageModel)
            return;
        return i_adnetPackageModel.getId();
    }

    private onSelecting(event) {
        var itemSelected: ISimpleListItem = this.simpleList.getSelected() as ISimpleListItem;
        this.selectedAdnetPackageModel = itemSelected.item;

        var targetsIds = this.selectedAdnetPackageModel.getTargetIds();
        var targets: List<AdnetTargetModel> = this.appStore.getState().adnet.getIn(['targets']) || {};

        var selectedAdnetTargetModels = targets.filter((i_adnetTargetModel: AdnetTargetModel) => {
            return (targetsIds.indexOf(i_adnetTargetModel.getId()) > -1)
        }) as List<AdnetTargetModel>;

        this.onPropSelected.emit({selected: AdnetNetworkPropSelector.PACKAGE})
        this.onAdnetPacakgedSelected.emit(this.selectedAdnetPackageModel)
        this.onAdnetTargetsSelected.emit(selectedAdnetTargetModels);
    }

    private getName(i_adnetPackageModel: AdnetPackageModel) {
        if (i_adnetPackageModel)
            return i_adnetPackageModel.getName();
    }

    private ngOnDestroy() {
        this.unsub();
    }

    nodes = [
        {
            id: 1,
            name: 'root1',
            children: [
                { id: 2, name: 'child1' },
                { id: 3, name: 'child2' }
            ]
        },
        {
            id: 4,
            name: 'root2',
            children: [
                { id: 5, name: 'child2.1' },
                {
                    id: 6,
                    name: 'child2.2',
                    children: [
                        { id: 7, name: 'subsub' }
                    ]
                }
            ]
        }
    ];


    // files: TreeNode[] = [
    //     {
    //         "data":
    //             [
    //                 {
    //                     "label": "Documents",
    //                     "data": "Documents Folder",
    //                     "expandedIcon": "fa-folder-open",
    //                     "collapsedIcon": "fa-folder",
    //                     "children": [{
    //                         "label": "Work",
    //                         "data": "Work Folder",
    //                         "expandedIcon": "fa-folder-open",
    //                         "collapsedIcon": "fa-folder",
    //                         "children": [{"label": "Expenses.doc", "icon": "fa-file-word-o", "data": "Expenses Document"}, {"label": "Resume.doc", "icon": "fa-file-word-o", "data": "Resume Document"}]
    //                     },
    //                         {
    //                             "label": "Home",
    //                             "data": "Home Folder",
    //                             "expandedIcon": "fa-folder-open",
    //                             "collapsedIcon": "fa-folder",
    //                             "children": [{"label": "Invoices.txt", "icon": "fa-file-word-o", "data": "Invoices for this month"}]
    //                         }]
    //                 },
    //                 {
    //                     "label": "Pictures",
    //                     "data": "Pictures Folder",
    //                     "expandedIcon": "fa-folder-open",
    //                     "collapsedIcon": "fa-folder",
    //                     "children": [
    //                         {"label": "barcelona.jpg", "icon": "fa-file-image-o", "data": "Barcelona Photo"},
    //                         {"label": "logo.jpg", "icon": "fa-file-image-o", "data": "PrimeFaces Logo"},
    //                         {"label": "primeui.png", "icon": "fa-file-image-o", "data": "PrimeUI Logo"}]
    //                 },
    //                 {
    //                     "label": "Movies",
    //                     "data": "Movies Folder",
    //                     "expandedIcon": "fa-folder-open",
    //                     "collapsedIcon": "fa-folder",
    //                     "children": [{
    //                         "label": "Al Pacino",
    //                         "data": "Pacino Movies",
    //                         "children": [{"label": "Scarface", "icon": "fa-file-video-o", "data": "Scarface Movie"}, {"label": "Serpico", "icon": "fa-file-video-o", "data": "Serpico Movie"}]
    //                     },
    //                         {
    //                             "label": "Robert De Niro",
    //                             "data": "De Niro Movies",
    //                             "children": [{"label": "Goodfellas", "icon": "fa-file-video-o", "data": "Goodfellas Movie"}, {"label": "Untouchables", "icon": "fa-file-video-o", "data": "Untouchables Movie"}]
    //                         }]
    //                 }
    //             ]
    //     }
    // ]

}