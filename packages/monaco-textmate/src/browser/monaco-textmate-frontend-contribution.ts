/*
 * Copyright (C) 2018 Ericsson and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { injectable, inject } from 'inversify';
import { loadWASM } from 'onigasm';
import { FrontendApplicationContribution } from '@theia/core/lib/browser';
import { MonacoTextmateService } from './monaco-textmate-service';

@injectable()
export class MonacoTextmateFrontendApplicationContribution implements FrontendApplicationContribution {

    @inject(MonacoTextmateService)
    protected readonly monacoTextmateService: MonacoTextmateService;

    async onStart() {
        await loadWASM(require('onigasm/lib/onigasm.wasm'));
        this.monacoTextmateService.init();
    }

}
