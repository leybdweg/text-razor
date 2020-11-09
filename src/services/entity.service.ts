import {OnModuleInit} from "@nestjs/common";
import {Connection, createConnection} from "mysql2";

export enum WebsiteStatus {
    pending = 'pending',
    completed = 'completed',
    failed = 'failed',
    processing = 'processing',
}

export interface Entity {
    readonly id?: number;
    readonly razorId: string;
    readonly razorData: object;
    readonly fileId: string;
}

export class EntityService implements OnModuleInit {
    private readonly dbConnection: Connection;

    constructor() {
        this.dbConnection = createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER|| 'me',
            password: process.env.DB_PASSWORD || 'secret',
            database: process.env.DB_SCHEME || 'my_dev',
            // debug: true,
            // trace: true,
            multipleStatements: true
        })
    }

    async onModuleInit(): Promise<void> {
        await this.dbConnection.promise().connect();
    }

    async createEntity(entity: Entity): Promise<void> {
        const sql = 'INSERT INTO entities (razorId, razorData, fileId, createdAt) VALUES(?, ?, ?, NOW());';
        const replacements = [
            entity.razorId,
            entity.razorData,
            entity.fileId
        ];
        let result;

        try {
            result = await this.dbConnection.promise().execute(sql, replacements);
        } catch (e) {
            console.error('Failed to create website \n'); // TODO: add more info to error log
        } finally { // TODO: consider a better approach
            // if(result[0]?.affectedRows != 1) {
            if(!result) {
                throw new Error('Failed to persist website creation')
            }
        }
    }

    async getEntities(fileId: string):Promise<Entity[]> {
        const sql = `
            SET @total := (SELECT count(1) from entities) ;
            SELECT
                COUNT(1) as appearanceCount,
                razorId 
            FROM
                my_dev.entities
            WHERE
                fileId = ? 
            GROUP BY
                razorId 
            HAVING 
                (appearanceCount/@total) > ?
            ;
            `
        const replacements = [
            fileId,
            process.env.PERCENTANGE_CUT || 0.2
        ];
        const dbResult = await this.dbConnection.promise().execute(sql, replacements);

        const entities: Entity[] = (dbResult[0] as any[]).map(dbRow => {
            return {
                id: dbRow.id,
                razorId: dbRow.razorId,
                razorData: dbRow.razorData,
                fileId: dbRow.fileId,
                createdAt: dbRow.createdAt
            } as Entity
        })

        return entities;
    }
}
