import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: [
          'seo_sitemap_include_kml', 
          'seo_local_org_name', 
          'seo_local_website_name',
          'seo_local_address',
          'seo_local_geo_coords',
          'seo_local_phones'
        ] }
      }
    });

    const includeKml = settings.find(s => s.key === 'seo_sitemap_include_kml')?.value !== 'false';

    if (!includeKml) {
      return new NextResponse('KML Sitemap disabled', { status: 404 });
    }

    // Pull data using the correct Local SEO keys
    const name = settings.find(s => s.key === 'seo_local_org_name')?.value 
                 || settings.find(s => s.key === 'seo_local_website_name')?.value || '';
    
    // Address is saved as JSON: { streetAddress, addressLocality, addressRegion, postalCode, addressCountry }
    const addressJsonStr = settings.find(s => s.key === 'seo_local_address')?.value;
    let address = '';
    if (addressJsonStr) {
      try {
        const addressObj = JSON.parse(addressJsonStr);
        address = [
          addressObj.streetAddress, 
          addressObj.addressLocality, 
          addressObj.addressRegion, 
          addressObj.postalCode, 
          addressObj.addressCountry
        ].filter(Boolean).join(', ');
      } catch (e) {}
    }

    // Coords are saved as "lat, lng" string
    const coordsStr = settings.find(s => s.key === 'seo_local_geo_coords')?.value || '';
    const [lat, lng] = coordsStr.split(',').map(s => s.trim());

    // Phones are saved as JSON array: [{ type, number }]
    const phonesJsonStr = settings.find(s => s.key === 'seo_local_phones')?.value;
    let phone = '';
    if (phonesJsonStr) {
      try {
        const phonesArr = JSON.parse(phonesJsonStr);
        if (phonesArr.length > 0) {
          phone = phonesArr[0].number;
        }
      } catch (e) {}
    }

    let kml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    kml += `<?xml-stylesheet type="text/xsl" href="/kml-sitemap.xsl"?>\n`;
    kml += `<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    kml += `  <Document>\n`;
    kml += `    <name>Locations for ${name}</name>\n`;

    kml += `    <Placemark>\n`;
    kml += `      <name>${name}</name>\n`;
    if (address) {
      kml += `      <address>${address}</address>\n`;
    }
    if (phone) {
      kml += `      <phoneNumber>${phone}</phoneNumber>\n`;
    }
    kml += `      <Point>\n`;
    kml += `        <coordinates>${lng || '0'},${lat || '0'}</coordinates>\n`;
    kml += `      </Point>\n`;
    kml += `    </Placemark>\n`;

    kml += `  </Document>\n`;
    kml += `</kml>`;

    return new NextResponse(kml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating locations.kml:', error);
    return new NextResponse('Error generating KML', { status: 500 });
  }
}
