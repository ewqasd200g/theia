/**
 * Copyright (C) 2018 Ericsson and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

export interface Theme {
    id: string;
    label: string;
    description?: string;
    editorTheme?: string;
    activate(): void;
    deactivate(): void;
}

export const ThemeProvider = Symbol('ThemeProvider');
export interface ThemeProvider {

    /**
     * Asynchronous call, this is used to make the I/O required to fetch the themes.
     */
    gatherThemes(): Promise<Theme[]>;
}