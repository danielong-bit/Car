import html from '@/out/index.html?raw';
import {showroomPage} from '@/lib/cms/page';
export const dynamic='force-dynamic';
export function GET(request:Request){return showroomPage(request,html);}
