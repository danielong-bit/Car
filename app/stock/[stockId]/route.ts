import html from '@/out/cms-vehicle.html?raw';
import {showroomPage} from '@/lib/cms/page';
export function GET(request:Request){return showroomPage(request,html);}
