// QC World – tư thế nhân vật bằng cách "ngắm" xương theo hướng thế giới (không phụ thuộc trục xương của từng rig Mixamo)
export function makePoser(THREE, actor){
  const bones={}; actor.g.traverse(o=>{ if(o.isBone) bones[o.name.replace(/^mixamorig:?/,'')]=o; });
  const a=new THREE.Vector3(), b=new THREE.Vector3(), d=new THREE.Vector3(), q=new THREE.Quaternion(), pq=new THREE.Quaternion(), wq=new THREE.Quaternion(), I=new THREE.Quaternion();
  const U=new THREE.Vector3(0,1,0), F=new THREE.Vector3(), R=new THREE.Vector3(), v=new THREE.Vector3();
  function aim(name, child, dir, w=1){ const B=bones[name], C=bones[child]; if(!B||!C||w<=0) return;
    B.getWorldPosition(a); C.getWorldPosition(b); b.sub(a).normalize(); d.copy(dir).normalize();
    q.setFromUnitVectors(b, d); if(w<1) q.slerpQuaternions(I, q, w);
    B.getWorldQuaternion(wq); B.parent.getWorldQuaternion(pq); wq.premultiply(q); B.quaternion.copy(pq.invert().multiply(wq)); B.updateMatrixWorld(true); }
  const V=(f=0,u=0,r=0)=>v.set(0,0,0).addScaledVector(F,f).addScaledVector(U,u).addScaledVector(R,r).clone();
  let hipsH=null;
  const P={
    bones, ok:!!bones.Hips,
    hipsHeight(){ if(hipsH!=null) return hipsH; if(!bones.Hips) return hipsH=.95; actor.g.updateMatrixWorld(true); bones.Hips.getWorldPosition(a); return hipsH=a.y-actor.g.position.y; },
    apply(kind, t=0, w=1){
      if(!bones.Hips) return;
      // S-GFX (15/11): hướng TRƯỚC lấy theo thế giới (gồm cả xe/cabin đang chở nhân vật) – trước dùng rotation.y riêng (=0 khi ngồi trong xe)
      // nên khi xe quay, chân bị duỗi theo hướng cố định của thế giới → đâm xuyên hông/gầm xe
      actor.g.updateMatrixWorld(true); actor.g.getWorldDirection(F); F.y=0; if(F.lengthSq()<1e-6) F.set(0,0,1); F.normalize(); R.set(-F.z,0,F.x);
      const sit=()=>{ for(const s of ['Left','Right']){ aim(s+'UpLeg', s+'Leg', V(1,-.12)); aim(s+'Leg', s+'Foot', V(.15,-1)); } };
      switch(kind){
        case 'sit': sit(); for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm',s+'ForeArm',V(.45,-1,k*.1)); aim(s+'ForeArm',s+'Hand',V(1,-.35)); } break;
        // S-GFX (15/11): ngồi trong XE HƠI – ghế thấp, chân duỗi chéo ra trước, bàn chân đặt trên sàn xe (≈ hông − 0,3 m) thay vì cẳng chân thẳng đứng
        // (tư thế 'sit' làm bàn chân thòi xuống dưới sàn → lòi ra gầm xe / xuyên thân xe)
        case 'car': for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'UpLeg', s+'Leg', V(1,.04,k*.06)); aim(s+'Leg', s+'Foot', V(.8,-.6)); aim(s+'Arm',s+'ForeArm',V(.35,-1,k*.12)); aim(s+'ForeArm',s+'Hand',V(1,-.15,-k*.15)); } break;
        case 'type': sit(); for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm',s+'ForeArm',V(.55,-1,k*.12)); aim(s+'ForeArm',s+'Hand',V(1,.05+Math.sin(t*14+k)*.06,-k*.25)); } break;
        case 'eat': sit(); { const e=Math.max(0,Math.sin(t*1.6)); aim('LeftArm','LeftForeArm',V(.45,-1,-.1)); aim('LeftForeArm','LeftHand',V(1,-.2,.2));
          aim('RightArm','RightForeArm',V(.6,-1+e*.6,.15)); aim('RightForeArm','RightHand',V(.6,.2+e*1.1,-.2)); } break;
        case 'phone': aim('RightArm','RightForeArm',V(.1,-1,.25)); aim('RightForeArm','RightHand',V(.2,1,-.4)); break;
        case 'present': { const e=Math.sin(t*1.3); aim('RightArm','RightForeArm',V(.5,.1,.7+e*.2)); aim('RightForeArm','RightHand',V(.4,.4,.8)); } break;
        case 'cross': for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'Arm',s+'ForeArm',V(.3,-1,k*.15)); aim(s+'ForeArm',s+'Hand',V(.6,.25,-k*1)); } break;
        case 'dance': { const b=Math.sin(t*6.2), c=Math.cos(t*3.1), dip=Math.abs(b)*.07;
          aim('Spine','Spine1',V(0,1,c*.18));
          for(const [s,k] of [['Left',-1],['Right',1]]){ const up=.5+.5*(k>0?b:-b); aim(s+'Arm',s+'ForeArm',V(.3,up-.2,k*.8)); aim(s+'ForeArm',s+'Hand',V(.25,1,k*(.3+.35*c))); }
          // nhún hông theo trục thẳng đứng của thế giới (không phụ thuộc trục xương)
          const H=bones.Hips; H.getWorldPosition(a); a.y-=dip; H.parent.updateMatrixWorld(true); H.position.copy(H.parent.worldToLocal(a.clone())); H.updateMatrixWorld(true);
          for(const [s,k] of [['Left',-1],['Right',1]]){ aim(s+'UpLeg',s+'Leg',V(.2+dip*3,-1,k*.08)); aim(s+'Leg',s+'Foot',V(-.12,-1,0)); } break; }
        case 'jump': { const k=t;   // t = độ co người 0..1 (cao nhất ở đỉnh cú nhảy), w = độ hoà với animation đang chạy
          for(const [s,kk] of [['Left',-1],['Right',1]]){ aim(s+'UpLeg',s+'Leg',V(.95*k,-1,kk*.06),w); aim(s+'Leg',s+'Foot',V(-.65*k,-1,0),w);
            aim(s+'Arm',s+'ForeArm',V(.35,-.55+.95*k,kk*.75),w); aim(s+'ForeArm',s+'Hand',V(.55,.25+.45*k,kk*.3),w); } break; }
        case 'nod': aim('Neck','Head',V(Math.sin(t*9)*.35,1,0)); break;
        case 'shake': aim('Neck','Head',V(0,1,Math.sin(t*9)*.4)); break;
      }
    }
  };
  return P;
}
