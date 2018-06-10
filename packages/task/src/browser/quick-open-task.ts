/*
 * Copyright (C) 2017 Ericsson and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from 'inversify';
import { QuickOpenService, QuickOpenModel, QuickOpenItem, QuickOpenMode } from '@theia/core/lib/browser/quick-open/';
import { TaskService } from './task-service';
import { TaskConfigurations } from "./task-configurations";
import { TaskInfo, TaskConfiguration } from '../common/task-protocol';

@injectable()
export class QuickOpenTask implements QuickOpenModel {

    protected items: QuickOpenItem[];

    constructor(
        @inject(TaskService) protected readonly taskService: TaskService,
        @inject(TaskConfigurations) protected readonly taskConfigurations: TaskConfigurations,
        @inject(QuickOpenService) protected readonly quickOpenService: QuickOpenService
    ) { }

    async open(): Promise<void> {
        this.items = [];

        const configuredTasks = await this.taskConfigurations.getTasks();
        for (const task of configuredTasks) {
            this.items.push(new TaskRunQuickOpenItem(task, this.taskService, false));
        }

        const providedTasks = await this.taskService.getProvidedTasks();
        for (const task of providedTasks) {
            this.items.push(new TaskRunQuickOpenItem(task, this.taskService, true));
        }

        this.quickOpenService.open(this, {
            placeholder: 'Type the name of a task you want to execute',
            fuzzyMatchLabel: true,
            fuzzySort: true
        });
    }

    attach(): void {
        this.items = [];

        this.taskService.getRunningTasks().then(tasks => {
            for (const task of tasks) {
                // can only attach to terminal processes, so only list those
                if (task.terminalId) {
                    this.items.push(
                        new TaskAttachQuickOpenItem(
                            task,
                            this.getRunningTaskLabel(task),
                            this.taskService
                        )
                    );
                }
            }
            this.quickOpenService.open(this, {
                placeholder: 'Choose task to open',
                fuzzyMatchLabel: true,
                fuzzySort: true
            });
        });
    }

    public getItems(lookFor: string): QuickOpenItem[] {
        return this.items;
    }

    onType(lookFor: string, acceptor: (items: QuickOpenItem[]) => void): void {
        acceptor(this.items);
    }

    protected getRunningTaskLabel(task: TaskInfo): string {
        return `Task id: ${task.taskId}, label: ${task.config.label}`;
    }

}

export class TaskRunQuickOpenItem extends QuickOpenItem {

    constructor(
        protected readonly task: TaskConfiguration,
        protected taskService: TaskService,
        protected readonly provided: boolean
    ) {
        super();
    }

    getLabel(): string {
        return `${this.task.type}: ${this.task.label}`;
    }

    getDescription(): string {
        return this.provided ? 'provided' : '';
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        this.taskService.run(this.task.type, this.task.label);

        return true;
    }
}

export class TaskAttachQuickOpenItem extends QuickOpenItem {

    constructor(
        protected readonly task: TaskInfo,
        protected readonly taskLabel: string,
        protected taskService: TaskService
    ) {
        super();
    }

    getLabel(): string {
        return this.taskLabel!;
    }

    run(mode: QuickOpenMode): boolean {
        if (mode !== QuickOpenMode.OPEN) {
            return false;
        }
        if (this.task.terminalId) {
            this.taskService.attach(this.task.terminalId, this.task.taskId);
        }
        return true;
    }
}
