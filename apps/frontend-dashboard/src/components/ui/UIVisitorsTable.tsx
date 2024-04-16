/* eslint-disable max-lines */

import React, { useMemo } from 'react';
import { CSVLink } from 'react-csv';
import type { ColDef as ColData } from 'ag-grid-community';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';

import { useVisitorsStore } from '@/lib/store/useVisitorsStore';
import { type Visitor } from '@/lib/types/ui/visitor';
import { routes } from '@/lib/routes';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/component';

import { UIButton } from './UIButton';
import {
	UIDropdownMenu,
	UIDropdownMenuTrigger,
	UIDropdownMenuContent,
	UIDropdownMenuLabel,
	UIDropdownMenuItem,
	UIDropdownMenuSeparator,
} from './UIDropdownMenu';
import UISvg from './UISvg';
import { UICardDescription, UICardTitle } from './UICard';
import CustomHeader from './UICustomTableHeader';
import { UIAvatar, UIAvatarImage, UIAvatarFallback } from './UIAvatar';

type Props = {
	readonly data: Visitor[];
	readonly className?: string;
	readonly liveUpdates?: boolean;
	readonly dataOnly?: boolean;
	readonly onRowAction?: (visitor: Visitor) => void;
};

const UIVisitorsTable = (props: Props) => {
	const pathname = usePathname();
	const currentDate = new Date();

	const setCurrentVisitor = useVisitorsStore((state) => state.setCurrentVisitor);

	const onSetCurrentVisitor = (visitor: Visitor) => {
		setCurrentVisitor(visitor);
	};

	const csvHeaders = [
		{ label: 'Full name', key: 'fullName' },
		{ label: 'Company', key: 'company' },
		{ label: 'Title', key: 'title' },
		{ label: 'Email', key: 'email' },
		{ label: 'Last visit', key: 'lastVisit' },
	];

	const gridOptions = {
		defaultColDef: {
			cellClass: 'flex items-center h-full min-w-4',
		},
		components: {
			CustomHeader: CustomHeader,
		},

		ensureDomOrder: true,
	};

	const columnData = useMemo(() => {
		const baseColumns: ColData<Visitor>[] = [
			{
				field: 'fullName',
				headerName: 'Full name',
				flex: 1,
				filter: true,
				resizable: true,
				width: 200,
				// headerComponent: 'CustomHeader',
				cellRenderer: (params: { value: string; data: { visitorLinkedinUrl: string } }) => {
					return (
						<div className="flex items-center min-w-16 gap-2">
							<span className="capitalize">{params.value}</span>
							<Link href={params.data.visitorLinkedinUrl} target="_blank">
								<UISvg name="linkedinLogoWhite" />
							</Link>
						</div>
					);
				},
			},
			{
				field: 'companyInfo.name',
				headerName: 'Company',
				flex: 1,
				filter: true,
				resizable: true,
				width: 200,
				headerComponent: 'CustomHeader',
				cellRenderer: (params: {
					data: {
						companyInfo: {
							logoUrl: string | undefined;
							name: string;
						};
					};
				}) => {
					return (
						<div className="flex items-center gap-2 min-w-16">
							<UIAvatar className="w-7 h-7 border">
								<UIAvatarImage src={params.data.companyInfo.logoUrl} />
								<UIAvatarFallback>CN</UIAvatarFallback>
							</UIAvatar>
							<span className="capitalize">{params.data.companyInfo.name}</span>
						</div>
					);
				},
			},
			{
				field: 'title',
				headerName: 'Title',
				flex: 1,
				filter: true,
				resizable: true,
				width: 200,
				headerComponent: 'CustomHeader',
				cellRenderer: (params: { value: string }) => <span className="capitalize min-w-16">{params.value}</span>,
			},
			{
				field: 'email',
				headerName: 'Email',
				flex: 1,
				filter: true,
				resizable: true,
				width: 200,
				headerComponent: 'CustomHeader',
				cellRenderer: (params: { value: string }) => <span className="lowercase min-w-16">{params.value}</span>,
			},
			{
				field: 'lastVisit',
				headerName: 'Last Visit',
				flex: 1,
				filter: true,
				resizable: true,
				width: 200,
				cellRenderer: (params: { value: Date }) => <span className="uppercase min-w-16">{formatDate(params.value)}</span>,
			},
		];

		if (!props.dataOnly) {
			baseColumns.push({
				filter: false,
				resizable: false,
				pinned: 'right',
				width: 50,
				cellRenderer: (params: { data: Visitor }) => {
					const visitor = params.data;

					return (
						<UIDropdownMenu>
							<UIDropdownMenuTrigger asChild>
								<UIButton variant="ghost" className="h-8 w-8 p-0">
									<span className="sr-only">Open menu</span>
									<MoreHorizontal className="h-4 w-4" />
								</UIButton>
							</UIDropdownMenuTrigger>
							<UIDropdownMenuContent align="end">
								<UIDropdownMenuLabel>Actions</UIDropdownMenuLabel>
								<UIDropdownMenuItem onClick={() => onSetCurrentVisitor(visitor)}>
									<Link className="w-full" href={`${pathname}/${visitor.id}`} passHref>
										Message
									</Link>
								</UIDropdownMenuItem>
								<UIDropdownMenuItem onClick={() => navigator.clipboard.writeText(visitor.email)}>
									Copy visitor email
								</UIDropdownMenuItem>
								<UIDropdownMenuSeparator />
								<UIDropdownMenuItem>View visitor details</UIDropdownMenuItem>
							</UIDropdownMenuContent>
						</UIDropdownMenu>
					);
				},
			});
		}

		return baseColumns;
	}, [props.dataOnly]);

	return (
		<div className="w-full h-full overflow-hidden">
			{props.dataOnly ? (
				<div className="flex items-center justify-between mb-6">
					<div className="gap-1.5">
						<UICardTitle className=" text-xl">Recent visitors</UICardTitle>
						<UICardDescription className=" text-sm">View and manage your visitors</UICardDescription>
					</div>
					<UIButton asChild className="bg-[#15803D]">
						<Link href={routes.visitors.path} className="text-white">
							<UISvg name="arrowUpRight" className="mr-2" />
							View all
						</Link>
					</UIButton>
				</div>
			) : (
				<div className="flex items-center py-4 gap-2">
					<UIButton className="rounded-3xl" variant="secondary" asChild>
						<CSVLink
							data={props.data}
							headers={csvHeaders}
							filename={`visitors-${currentDate.getDate()}-${
								currentDate.getMonth() + 1
							}-${currentDate.getFullYear()}-${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`}
						>
							Export to CSV
						</CSVLink>
					</UIButton>
				</div>
			)}
			<div className={cn(props.dataOnly ? 'h-[calc(100vh-415px)]' : 'h-[calc(100vh-254px)]', 'ag-theme-alpine flex flex-col  overflow-auto')}>
				<AgGridReact
					rowData={props.data}
					columnDefs={columnData}
					rowDragManaged
					gridOptions={gridOptions}
					domLayout="autoHeight"
					enableAdvancedFilter
				/>
			</div>

			{!props.dataOnly && (
				<div className="flex items-center justify-between mt-auto py-4 flex-1 ">
					{props.liveUpdates ? (
						<div className="flex items-center space-x-2">
							<span className="h-2 w-2 rounded-full bg-primary animate-pulse-slow" />
							<span className=" text-muted-foreground text-sm">Updating live from your website</span>
						</div>
					) : (
						<UIButton variant="ghost" size="sm">
							<UISvg name="plus" className="mr-1 iconStroke" />
							Add prospect
						</UIButton>
					)}
				</div>
			)}
		</div>
	);
};

export default React.memo(UIVisitorsTable);
