import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type WalletLedgerDocument=HydratedDocument<WalletLedger>;
@Schema({timestamps:true})
export class WalletLedger {
  @Prop({required:true,index:true}) userId:string;
  @Prop({required:true}) type:string;
  @Prop({required:true}) amount:number;
  @Prop({required:true}) balanceAfter:number;
  @Prop() reference?:string;
  @Prop() note?:string;
}
export const WalletLedgerSchema=SchemaFactory.createForClass(WalletLedger);
